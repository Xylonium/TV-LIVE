const axios = require("axios");
const he = require("he");
const qs = require('qs');
const CryptoJS = require('crypto-js');

const PAGE_SIZE = 50;
const LYRICS_API_BASE_URL = 'https://lrc.xms.mx';
const DURATION_TOLERANCE_SECONDS = 5;
const PROGRESS_REPORT_INTERVAL_MS = 10000;
const PLAYED_DURATION_INCREMENT_INTERVAL_MS = 1000;

const QQ_MATCH_CANDIDATES_LIMIT = 30;
const QQ_IMPORT_CONCURRENCY = 5;
const NCM_MATCH_CANDIDATES_LIMIT = 30;
const NCM_IMPORT_CONCURRENCY = 10;

const EMBY_CLIENT_NAME = 'MusicFree';
const EMBY_DEVICE_NAME = 'MusicFree Client (Emby Plugin)';
const EMBY_APP_VERSION = '3.1.6';

let embyTokenCache = { token: null, userId: null, serverId: null, expiry: 0 };
let embyUserDetailsCache = null;
let currentPlayingTrackInfo = null;
let globalEmbyDeviceId = null;
let libraryCache = { musicLibraryId: null, audiobooksLibraryId: null, expiry: 0 };

const ALL_SONGS_SHEET_INSTANCE_ID = 'emby_special_allsongs_sheet_instance';
const ALL_SONGS_FIXED_ARTWORK_URL = 'https://p1.music.126.net/oT-RHuPBJiD7WMoU7WG5Rw==/109951166093489621.jpg';
const FETCH_ALL_LIMIT = 999999;

function getUserAgent() {
    return `MusicFree-EmbyPlugin/${EMBY_APP_VERSION}`;
}

const EXTERNAL_API_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36';

function getUserVariables() {
    if (typeof env !== 'undefined' && typeof env.getUserVariables === 'function') {
        return env.getUserVariables();
    }
    return {};
}

function shouldShowAudiobooks() {
    const userVars = getUserVariables();
    return userVars.showAudiobooks === 'yes';
}

function initializeGlobalDeviceId() {
    if (globalEmbyDeviceId) return;

    const userVars = getUserVariables();
    const configDeviceId = userVars.deviceId;

    if (configDeviceId && configDeviceId.trim() !== "") {
        globalEmbyDeviceId = configDeviceId;
    } else {
        const username = userVars.username;
        if (username && username.trim() !== "") {
            try {
                globalEmbyDeviceId = CryptoJS.MD5(username).toString(CryptoJS.enc.Hex);
            } catch (e) {
                globalEmbyDeviceId = 'e21cc73f4e89eb1fad0657fd667442df';
            }
        } else {
            globalEmbyDeviceId = 'e21cc73f4e89eb1fad0657fd667442df';
        }
    }
}

function normalize(str) {
    if (!str) return '';
    let cleanedStr = str.replace(/(?:\s*[(（\[【].*?[)）\]】]\s*)$/, '');
    return cleanedStr
        .replace(/[\s!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~\u200B-\u200D\uFEFF]/gu, '')
        .toLowerCase();
}

function deduplicateTracks(tracks) {
    const seen = new Set();
    return tracks.filter(function(track) {
        if (!track || !track.id) return false;
        const trackSignature = `${track.id}-${normalize(track.title)}-${normalize(track.artist)}`;
        if (seen.has(trackSignature)) return false;
        seen.add(trackSignature);
        return true;
    });
}

function normalizeUrl(url) {
    if (!url) return '';
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = `http://${url}`;
    }
    return url.replace(/\/+$/, "");
}

async function getEmbyToken(forceRefresh) {
    if (forceRefresh === undefined) forceRefresh = false;

    initializeGlobalDeviceId();

    const userVars = getUserVariables();
    const url = userVars.url;
    const username = userVars.username;
    const password = userVars.password;

    if (!url || !username || !password) {
        return null;
    }

    const now = Date.now();
    if (!forceRefresh && embyTokenCache.token && embyTokenCache.expiry > now && embyTokenCache.userId) {
        return embyTokenCache;
    }

    const authUrl = `${normalizeUrl(url)}/Users/AuthenticateByName`;
    const headers = {
        'Content-Type': 'application/json',
        'X-Emby-Authorization': `Emby Client="${EMBY_CLIENT_NAME}", Device="${EMBY_DEVICE_NAME}", DeviceId="${globalEmbyDeviceId}", Version="${EMBY_APP_VERSION}"`,
        'User-Agent': getUserAgent()
    };

    try {
        const response = await axios.post(authUrl, { Username: username, Pw: password }, { headers: headers, timeout: 15000 });
        if (response.data && response.data.AccessToken && response.data.User && response.data.User.Id) {
            embyTokenCache = {
                token: response.data.AccessToken,
                userId: response.data.User.Id,
                serverId: response.data.ServerId,
                expiry: now + 23 * 60 * 60 * 1000
            };
            embyUserDetailsCache = response.data.User;
            libraryCache.expiry = 0;
            return embyTokenCache;
        }
        return null;
    } catch (error) {
        return null;
    }
}

async function getEmbyApiAuthHeaders(forceTokenRefresh) {
    if (forceTokenRefresh === undefined) forceTokenRefresh = false;

    initializeGlobalDeviceId();

    const tokenInfo = await getEmbyToken(forceTokenRefresh);
    if (!tokenInfo) return null;

    let authHeader = `Emby Client="${EMBY_CLIENT_NAME}", Device="${EMBY_DEVICE_NAME}", DeviceId="${globalEmbyDeviceId}", Version="${EMBY_APP_VERSION}"`;
    if (tokenInfo.token) {
        authHeader += `, Token="${tokenInfo.token}"`;
    }

    return {
        'X-Emby-Authorization': authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': getUserAgent()
    };
}

async function httpEmby(method, path, params, data, retryAttempt) {
    if (params === undefined) params = {};
    if (data === undefined) data = null;
    if (retryAttempt === undefined) retryAttempt = 0;

    const userVars = getUserVariables();
    const url = userVars.url;
    if (!url) return null;

    const fullUrl = `${normalizeUrl(url)}/${path.startsWith('/') ? path.substring(1) : path}`;
    let headers;
    try {
        headers = await getEmbyApiAuthHeaders(retryAttempt > 0);
        if (!headers) return null;
    } catch (authError) {
        return null;
    }

    const config = {
        method: method,
        url: fullUrl,
        headers: headers,
        timeout: 25000,
        paramsSerializer: function(p) { return qs.stringify(p, { arrayFormat: 'repeat' }); }
    };

    if (params && Object.keys(params).length > 0) {
        config.params = params;
    }
    if (data) {
        config.data = data;
    }

    try {
        const response = await axios(config);
        let totalCount = undefined;

        if (response.data && response.data.TotalRecordCount !== undefined) {
            totalCount = parseInt(response.data.TotalRecordCount, 10);
        } else if (response.headers && response.headers['x-total-count']) {
            totalCount = parseInt(response.headers['x-total-count'], 10);
        }

        if (method.toUpperCase() === 'GET' && totalCount !== undefined) {
            return { data: response.data, totalCount: totalCount, headers: response.headers };
        }
        return { data: response.data, headers: response.headers };
    } catch (error) {
        if (error.response) {
            if (error.response.status === 401 && retryAttempt === 0) {
                const refreshedTokenInfo = await getEmbyToken(true);
                if (refreshedTokenInfo) {
                    return await httpEmby(method, path, params, data, 1);
                } else {
                    return null;
                }
            }
        }
        return null;
    }
}

async function getLibraryIds() {
    const now = Date.now();
    if (libraryCache.musicLibraryId && libraryCache.expiry > now) {
        return {
            musicLibraryId: libraryCache.musicLibraryId,
            audiobooksLibraryId: shouldShowAudiobooks() ? libraryCache.audiobooksLibraryId : null,
        };
    }

    const tokenInfo = await getEmbyToken();
    if (!tokenInfo || !tokenInfo.userId) {
        return { musicLibraryId: null, audiobooksLibraryId: null };
    }

    try {
        const result = await httpEmby('GET', `Users/${tokenInfo.userId}/Views`);
        if (!result || !result.data || !result.data.Items) {
            return { musicLibraryId: null, audiobooksLibraryId: null };
        }

        const views = result.data.Items;
        const musicLibrary = views.find(function(v) { return v.CollectionType === 'music'; });
        const audiobooksLibrary = shouldShowAudiobooks() ? views.find(function(v) { return v.CollectionType === 'audiobooks'; }) : null;

        libraryCache = {
            musicLibraryId: musicLibrary ? musicLibrary.Id : null,
            audiobooksLibraryId: audiobooksLibrary ? audiobooksLibrary.Id : null,
            expiry: now + 60 * 60 * 1000
        };
        return {
            musicLibraryId: libraryCache.musicLibraryId,
            audiobooksLibraryId: libraryCache.audiobooksLibraryId,
        };

    } catch (e) {
        return { musicLibraryId: null, audiobooksLibraryId: null };
    }
}

function generateEmbyArtworkUrl(itemId, imageType, imageTag, maxWidth, maxHeight) {
    if (imageType === undefined) imageType = 'Primary';
    if (imageTag === undefined) imageTag = null;
    if (maxWidth === undefined) maxWidth = 400;
    if (maxHeight === undefined) maxHeight = 400;

    const userVars = getUserVariables();
    const url = userVars.url;
    if (!url || !itemId) return null;

    let path = `/Items/${itemId}/Images/${imageType}`;

    let queryParams = [];
    if (maxWidth) queryParams.push(`maxWidth=${String(maxWidth)}`);
    if (maxHeight) queryParams.push(`maxHeight=${String(maxHeight)}`);
    if (imageTag) queryParams.push(`tag=${imageTag}`);
    queryParams.push('format=jpg');
    queryParams.push('quality=90');

    const token = embyTokenCache.token;
    if (token) {
        queryParams.push(`api_key=${token}`);
    }

    return `${normalizeUrl(url)}${path}?${queryParams.join('&')}`;
}

async function formatMusicItem(embyItem) {
    const itemId = String(embyItem.Id);
    const title = embyItem.Name || "未知歌曲";
    let artistName = "未知艺术家";
    if (embyItem.ArtistItems && embyItem.ArtistItems.length > 0) {
        artistName = embyItem.ArtistItems.map(function(a) { return a.Name; }).join(' / ');
    } else if (embyItem.AlbumArtist) {
        artistName = embyItem.AlbumArtist;
    } else if (embyItem.Artists && embyItem.Artists.length > 0) {
        artistName = embyItem.Artists.join(' / ');
    }

    const album = embyItem.Album || "未知专辑";

    let artwork = null;

    if (embyItem.ImageTags && embyItem.ImageTags.Primary) {
        artwork = generateEmbyArtworkUrl(itemId, 'Primary', embyItem.ImageTags.Primary);
    } 
    else if (embyItem.AlbumId && embyItem.AlbumPrimaryImageTag) {
        artwork = generateEmbyArtworkUrl(embyItem.AlbumId, 'Primary', embyItem.AlbumPrimaryImageTag);
    } 
    else {
        const artistId = (embyItem.ArtistItems && embyItem.ArtistItems.length > 0 && embyItem.ArtistItems[0].Id) ? String(embyItem.ArtistItems[0].Id) : null;
        if (artistId) {
            try {
                const tokenInfo = await getEmbyToken();
                if (tokenInfo && tokenInfo.userId) {
                    const artistDetailsResult = await httpEmby('GET', `Users/${tokenInfo.userId}/Items/${artistId}`, {
                        UserId: tokenInfo.userId,
                        Fields: 'ImageTags'
                    });
                    if (artistDetailsResult && artistDetailsResult.data && artistDetailsResult.data.ImageTags && artistDetailsResult.data.ImageTags.Primary) {
                        artwork = generateEmbyArtworkUrl(artistId, 'Primary', artistDetailsResult.data.ImageTags.Primary);
                    }
                }
            } catch (e) {
                // 如果获取歌手图片失败，则忽略错误，避免影响整个列表加载
            }
        }
    }

    const duration = embyItem.RunTimeTicks ? Math.round(embyItem.RunTimeTicks / 10000000) : undefined;
    let suffix;
    if (embyItem.MediaSources && embyItem.MediaSources.length > 0 && embyItem.MediaSources[0].Container) {
        suffix = embyItem.MediaSources[0].Container.toLowerCase();
    }

    const formattedItem = {
        id: itemId,
        title: he.decode(title),
        artist: he.decode(artistName),
        album: he.decode(album),
        artwork: artwork,
        duration: duration,
        _albumId: embyItem.AlbumId ? String(embyItem.AlbumId) : undefined,
        _artistId: (embyItem.ArtistItems && embyItem.ArtistItems.length > 0 && embyItem.ArtistItems[0].Id) ? String(embyItem.ArtistItems[0].Id) : undefined,
        _mediaSources: embyItem.MediaSources,
        _imageTags: embyItem.ImageTags,
        _albumPrimaryImageTag: embyItem.AlbumPrimaryImageTag,
        _source: 'emby',
        _runTimeTicks: embyItem.RunTimeTicks
    };
    if (suffix) {
        formattedItem.suffix = suffix;
    }
    return formattedItem;
}

async function formatAlbumItem(embyAlbum) {
    const albumId = String(embyAlbum.Id);
    const title = embyAlbum.Name || "未知专辑";
    const artist = embyAlbum.AlbumArtist || (embyAlbum.ArtistItems && embyAlbum.ArtistItems.length > 0 ? embyAlbum.ArtistItems.map(function(a) { return a.Name; }).join(' / ') : "未知艺术家");

    let artwork = null;
    if (embyAlbum.ImageTags && embyAlbum.ImageTags.Primary) {
        artwork = generateEmbyArtworkUrl(albumId, 'Primary', embyAlbum.ImageTags.Primary);
    }

    let description = `歌曲数: ${embyAlbum.SongCount || embyAlbum.ChildCount || '?'}`;
    if (embyAlbum.ProductionYear) description += ` | 年份: ${embyAlbum.ProductionYear}`;
    if (embyAlbum.Genres && embyAlbum.Genres.length > 0) description += ` | 类型: ${embyAlbum.Genres.join(', ')}`;

    return {
        id: albumId,
        title: he.decode(title),
        artist: he.decode(artist),
        artwork: artwork,
        description: he.decode(description),
        date: embyAlbum.PremiereDate ? embyAlbum.PremiereDate.substring(0, 10) : (embyAlbum.ProductionYear ? String(embyAlbum.ProductionYear) : undefined),
        worksNum: embyAlbum.SongCount || embyAlbum.ChildCount,
        _songCount: embyAlbum.SongCount || embyAlbum.ChildCount,
        _productionYear: embyAlbum.ProductionYear,
        _genres: embyAlbum.Genres,
        _imageTags: embyAlbum.ImageTags,
    };
}

async function formatArtistItem(embyArtist) {
    const artistId = String(embyArtist.Id);
    const name = embyArtist.Name || "未知艺术家";

    let artwork = null;

    if (embyArtist.ImageTags && embyArtist.ImageTags.Primary) {
        artwork = generateEmbyArtworkUrl(artistId, 'Primary', embyArtist.ImageTags.Primary, 300, 300);
    }

    const userData = embyArtist.UserData;

    return {
        id: artistId,
        name: he.decode(name),
        avatar: artwork,
        description: embyArtist.Overview,
        fans: userData && userData.PlayCount !== undefined ? userData.PlayCount : undefined,
        worksNum: embyArtist.ChildCount,
    };
}

function formatSheetItem(embyPlaylist, ownerUsername, firstSongInfo) {
    if (ownerUsername === undefined) ownerUsername = "Emby 用户";
    if (firstSongInfo === undefined) firstSongInfo = null;

    const id = String(embyPlaylist.Id);
    const title = embyPlaylist.Name || embyPlaylist.title || "未知播放列表";
    let artwork = null;

    if (id === ALL_SONGS_SHEET_INSTANCE_ID || embyPlaylist._isCombinedLibrary) {
        artwork = ALL_SONGS_FIXED_ARTWORK_URL;
    } else {
        if (embyPlaylist.ImageTags && embyPlaylist.ImageTags.Primary) {
            artwork = generateEmbyArtworkUrl(id, 'Primary', embyPlaylist.ImageTags.Primary);
        }
        if (!artwork && firstSongInfo && firstSongInfo.artwork) {
            artwork = firstSongInfo.artwork;
        }
    }

    let description = `包含 ${embyPlaylist.ChildCount !== undefined ? embyPlaylist.ChildCount : (embyPlaylist.worksNum !== undefined ? embyPlaylist.worksNum : '?')} 首歌曲`;
    if (embyPlaylist.Overview) {
        description = embyPlaylist.Overview;
    } else if (embyPlaylist.description) {
        description = embyPlaylist.description;
    }

    const userData = embyPlaylist.UserData;
    const playCount = userData && userData.PlayCount !== undefined ? userData.PlayCount : undefined;
    const songCount = embyPlaylist.ChildCount !== undefined ? embyPlaylist.ChildCount : embyPlaylist.worksNum;
    const sheet = {
        id: id,
        title: he.decode(title),
        artist: ownerUsername,
        artwork: artwork,
        description: he.decode(description),
        coverImg: artwork,
        playCount: playCount,
        worksNum: songCount,
    };

    if (embyPlaylist._isLibrary) {
        sheet._isLibrary = true;
        sheet._libraryId = embyPlaylist._libraryId;
    }
    if (embyPlaylist._isCombinedLibrary) {
        sheet._isCombinedLibrary = true;
    }
    if (embyPlaylist._parentId) {
        sheet._parentId = embyPlaylist._parentId;
    }
    return sheet;
}

async function searchMusicInternal(query, page, limit) {
    if (limit === undefined) limit = PAGE_SIZE;
    const tokenInfo = await getEmbyToken();
    if (!tokenInfo) return { isEnd: true, data: [] };

    const params = {
        SearchTerm: query,
        IncludeItemTypes: 'Audio',
        Recursive: true,
        UserId: tokenInfo.userId,
        StartIndex: (page - 1) * limit,
        Limit: limit,
        Fields: 'PrimaryImageAspectRatio,MediaSources,Path,Album,AlbumId,ArtistItems,AlbumArtist,RunTimeTicks,ProviderIds,ImageTags,UserData,ChildCount,AlbumPrimaryImageTag'
    };
    const result = await httpEmby('GET', 'Items', params);
    if (!result || !result.data) return { isEnd: true, data: [] };

    const items = result.data.Items ? result.data.Items : [];
    const totalCount = result.totalCount !== undefined ? result.totalCount : items.length;
    const isEnd = (params.StartIndex + items.length) >= totalCount;
    const formattedDataPromises = items.map(function(item) { return formatMusicItem(item); });
    const formattedData = await Promise.all(formattedDataPromises);
    return { isEnd: isEnd, data: formattedData };
}

async function searchAlbumInternal(query, page) {
    const tokenInfo = await getEmbyToken();
    if (!tokenInfo) return { isEnd: true, data: [] };

    const params = {
        SearchTerm: query,
        IncludeItemTypes: 'MusicAlbum',
        Recursive: true,
        UserId: tokenInfo.userId,
        StartIndex: (page - 1) * PAGE_SIZE,
        Limit: PAGE_SIZE,
        Fields: 'PrimaryImageAspectRatio,ProductionYear,Genres,AlbumArtist,ArtistItems,SongCount,ImageTags,UserData,ChildCount,PremiereDate,DateCreated'
    };
    const result = await httpEmby('GET', 'Items', params);
    if (!result || !result.data) return { isEnd: true, data: [] };

    const items = result.data.Items ? result.data.Items : [];
    const totalCount = result.totalCount !== undefined ? result.totalCount : items.length;
    const isEnd = (params.StartIndex + items.length) >= totalCount;
    const formattedDataPromises = items.map(function(item) { return formatAlbumItem(item); });
    const formattedData = await Promise.all(formattedDataPromises);
    return { isEnd: isEnd, data: formattedData };
}

async function searchArtistInternal(query, page) {
    const tokenInfo = await getEmbyToken();
    if (!tokenInfo) return { isEnd: true, data: [] };

    const params = {
        SearchTerm: query,
        IncludeItemTypes: 'MusicArtist',
        Recursive: true,
        StartIndex: (page - 1) * PAGE_SIZE,
        Limit: PAGE_SIZE,
        Fields: 'PrimaryImageAspectRatio,ImageTags,UserData,Overview,ChildCount,SortName',
        SortBy: 'SortName',
        SortOrder: 'Ascending',
        EnableImageTypes: 'Primary,Backdrop,Thumb',
        ImageTypeLimit: 1,
        IncludeSearchTypes: false
    };

    const result = await httpEmby('GET', `Users/${tokenInfo.userId}/Items`, params);

    if (!result || !result.data) return { isEnd: true, data: [] };

    const items = result.data.Items ? result.data.Items : [];
    const totalCount = result.totalCount !== undefined ? result.totalCount : items.length;
    const isEnd = (params.StartIndex + items.length) >= totalCount;

    const formattedDataPromises = items.map(function(item) { return formatArtistItem(item); });
    const formattedData = await Promise.all(formattedDataPromises);
    return { isEnd: isEnd, data: formattedData };
}

async function searchPlaylistsInternal(query, page) {
    const tokenInfo = await getEmbyToken();
    if (!tokenInfo) return { isEnd: true, data: [] };

    let ownerUsername = "Emby 用户";
    if (embyUserDetailsCache && typeof embyUserDetailsCache.Name === 'string' && embyUserDetailsCache.Name.trim() !== '') {
        ownerUsername = embyUserDetailsCache.Name;
    }

    const params = {
        SearchTerm: query,
        IncludeItemTypes: 'Playlist',
        Recursive: true,
        StartIndex: (page - 1) * PAGE_SIZE,
        Limit: PAGE_SIZE,
        Fields: 'PrimaryImageAspectRatio,Overview,ImageTags,UserData,ChildCount,DateCreated,SortName',
        SortBy: 'SortName',
        SortOrder: 'Ascending',
        EnableImageTypes: 'Primary,Backdrop,Thumb',
        ImageTypeLimit: 1,
        IncludeSearchTypes: false
    };

    const result = await httpEmby('GET', `Users/${tokenInfo.userId}/Items`, params);

    if (!result || !result.data) return { isEnd: true, data: [] };

    const items = result.data.Items ? result.data.Items : [];
    const totalCount = result.totalCount !== undefined ? result.totalCount : items.length;
    const isEnd = (params.StartIndex + items.length) >= totalCount;
    const formattedData = items.map(function(item) {
        return formatSheetItem(item, ownerUsername, null);
    });

    return { isEnd: isEnd, data: formattedData };
}

async function getAlbumInfoApi(albumItem, page) {
    const tokenInfo = await getEmbyToken();
    if (!tokenInfo) return { isEnd: true, musicList: [] };

    if (page > 1) {
        return { isEnd: true, musicList: [] };
    }

    const tracksParams = {
        ParentId: albumItem.id,
        IncludeItemTypes: 'Audio',
        Recursive: true,
        UserId: tokenInfo.userId,
        Fields: 'PrimaryImageAspectRatio,MediaSources,Path,Album,AlbumId,ArtistItems,AlbumArtist,RunTimeTicks,ProviderIds,ImageTags,UserData,AlbumPrimaryImageTag',
        SortBy: 'ParentIndexNumber,SortName',
        SortOrder: 'Ascending',
        StartIndex: 0,
        Limit: FETCH_ALL_LIMIT
    };

    const tracksResult = await httpEmby('GET', `Users/${tokenInfo.userId}/Items`, tracksParams);
    if (!tracksResult || !tracksResult.data) return { isEnd: true, musicList: [] };

    const musicList = await Promise.all((tracksResult.data.Items || []).map(function(item) { return formatMusicItem(item); }));
    const totalTracks = tracksResult.totalCount !== undefined ? tracksResult.totalCount : musicList.length;

    let supplementaryAlbumData;
    const albumDetailsParams = {
        UserId: tokenInfo.userId,
        Fields: 'PrimaryImageAspectRatio,ProductionYear,Genres,AlbumArtist,ArtistItems,SongCount,ImageTags,UserData,ChildCount,Overview,PremiereDate,DateCreated'
    };
    const albumDataResult = await httpEmby('GET', `Users/${tokenInfo.userId}/Items/${albumItem.id}`, albumDetailsParams);
    if (albumDataResult && albumDataResult.data) {
        supplementaryAlbumData = await formatAlbumItem(albumDataResult.data);
        if (supplementaryAlbumData && totalTracks > 0) {
            supplementaryAlbumData.worksNum = totalTracks;
        }
    }
    return { isEnd: true, musicList: musicList, albumItem: supplementaryAlbumData };
}

async function getAllSongsFromLibrary(libraryId, page) {
    const tokenInfo = await getEmbyToken();
    if (!tokenInfo) return { isEnd: true, musicList: [] };

    const params = {
        ParentId: libraryId,
        IncludeItemTypes: 'Audio',
        Recursive: true,
        UserId: tokenInfo.userId,
        StartIndex: (page - 1) * PAGE_SIZE,
        Limit: PAGE_SIZE,
        SortBy: 'SortName',
        SortOrder: 'Ascending',
        Fields: 'PrimaryImageAspectRatio,MediaSources,Path,Album,AlbumId,ArtistItems,AlbumArtist,RunTimeTicks,ProviderIds,ImageTags,UserData,AlbumPrimaryImageTag'
    };
    const result = await httpEmby('GET', `Users/${tokenInfo.userId}/Items`, params);
    if (!result || !result.data) return { isEnd: true, musicList: [] };

    const musicList = await Promise.all((result.data.Items || []).map(formatMusicItem));
    const total = result.totalCount || 0;
    return {
        isEnd: (params.StartIndex + musicList.length) >= total,
        musicList: musicList
    };
}

async function getMusicSheetInfoApi(sheetItem, page) {
    const tokenInfo = await getEmbyToken();
    if (!tokenInfo) return { isEnd: true, musicList: [] };

    const ownerUsername = (embyUserDetailsCache && embyUserDetailsCache.Name) ? embyUserDetailsCache.Name : "Emby 用户";

    if (sheetItem.id === ALL_SONGS_SHEET_INSTANCE_ID && sheetItem._parentId) {
        const result = await getAllSongsFromLibrary(sheetItem._parentId, page);
        let updatedSheetItem;
        if (page === 1) {
            updatedSheetItem = Object.assign({}, sheetItem);
        }
        return {
            isEnd: result.isEnd,
            musicList: result.musicList,
            sheetItem: updatedSheetItem
        };
    }

    if (page > 1) {
        return { isEnd: true, musicList: [] };
    }

    const tracksParams = {
        UserId: tokenInfo.userId,
        StartIndex: 0,
        Limit: FETCH_ALL_LIMIT,
        Fields: 'PrimaryImageAspectRatio,MediaSources,Path,Album,AlbumId,ArtistItems,AlbumArtist,RunTimeTicks,ProviderIds,ImageTags,UserData,AlbumPrimaryImageTag'
    };
    
    const endpoint = `Playlists/${sheetItem.id}/Items`;
    const tracksResult = await httpEmby('GET', endpoint, tracksParams);
    
    if (!tracksResult || !tracksResult.data) return { isEnd: true, musicList: [] };
    
    const musicList = await Promise.all((tracksResult.data.Items || []).map(function(item) { return formatMusicItem(item); }));
    const totalTracks = tracksResult.totalCount !== undefined ? tracksResult.totalCount : musicList.length;
    
    let supplementarySheetData;
    try {
        const playlistDetailsResult = await httpEmby('GET', `Users/${tokenInfo.userId}/Items/${sheetItem.id}`, {
            UserId: tokenInfo.userId,
            Fields: 'PrimaryImageAspectRatio,Overview,ImageTags,UserData,ChildCount,DateCreated'
        });

        let baseSheetData = sheetItem;
        if (playlistDetailsResult && playlistDetailsResult.data) {
            baseSheetData = playlistDetailsResult.data;
        }
        baseSheetData.Id = baseSheetData.Id || sheetItem.id;
        baseSheetData.Name = baseSheetData.Name || sheetItem.title;
        baseSheetData.ChildCount = baseSheetData.ChildCount !== undefined ? baseSheetData.ChildCount : (totalTracks || musicList.length);

        supplementarySheetData = formatSheetItem(baseSheetData, ownerUsername, musicList.length > 0 ? musicList[0] : null);
        
        if (supplementarySheetData && totalTracks > 0) {
            supplementarySheetData.worksNum = totalTracks;
        }

    } catch (e) {
        let baseSheetData = { Id: sheetItem.id, Name: sheetItem.title, ChildCount: totalTracks || musicList.length };
        supplementarySheetData = formatSheetItem(baseSheetData, ownerUsername, musicList.length > 0 ? musicList[0] : null);
    }
    
    return { 
        isEnd: true,
        musicList: musicList, 
        sheetItem: supplementarySheetData 
    };
}

async function getArtistWorksApi(artistItem, page, type) {
    const tokenInfo = await getEmbyToken();
    if (!tokenInfo) return { isEnd: true, data: [] };

    const params = {
        UserId: tokenInfo.userId,
        Recursive: true,
        StartIndex: (page - 1) * PAGE_SIZE,
        Limit: PAGE_SIZE,
        SortOrder: 'Ascending',
    };

    let resultFormatter;
    if (type === 'music') {
        params.ArtistIds = artistItem.id;
        params.IncludeItemTypes = 'Audio';
        params.SortBy = 'Album,SortName';
        params.Fields = 'PrimaryImageAspectRatio,MediaSources,Path,Album,AlbumId,ArtistItems,AlbumArtist,RunTimeTicks,ProviderIds,ImageTags,UserData,AlbumPrimaryImageTag';
        resultFormatter = formatMusicItem;
    } else if (type === 'album') {
        params.AlbumArtistIds = artistItem.id;
        params.IncludeItemTypes = 'MusicAlbum';
        params.SortBy = 'ProductionYear,SortName';
        params.Fields = 'PrimaryImageAspectRatio,ProductionYear,Genres,AlbumArtist,ArtistItems,SongCount,ImageTags,UserData,ChildCount,PremiereDate,DateCreated';
        resultFormatter = formatAlbumItem;
    } else {
        return { isEnd: true, data: [] };
    }
    
    const result = await httpEmby('GET', 'Items', params);
    if (!result || !result.data) return { isEnd: true, data: [] };
    
    const items = result.data.Items ? result.data.Items : [];
    const totalCount = result.totalCount !== undefined ? result.totalCount : items.length;
    const formattedDataPromises = items.map(function(item) { return resultFormatter(item); });
    const formattedData = await Promise.all(formattedDataPromises);
    
    return {
        isEnd: (params.StartIndex + items.length) >= totalCount,
        data: formattedData
    };
}

async function markEmbyItemPlayed(itemId, userId) {
    if (!itemId) return;
    try {
        const token = await getEmbyToken();
        const currentUserId = userId || (token && token.userId);
        if (!currentUserId) return;
        await httpEmby('POST', `Users/${currentUserId}/PlayedItems/${itemId}`, {});
    } catch (e) {}
}

async function tryAutoFixMusicId(musicItem) {
    try {
        const searchResults = await searchMusicInternal(`${musicItem.title} ${musicItem.artist}`, 1, 5);
        if (searchResults && searchResults.data && searchResults.data.length > 0) {
            const found = searchResults.data.find(function(track) {
                return normalize(track.title) === normalize(musicItem.title) &&
                       normalize(track.artist) === normalize(musicItem.artist);
            });
            return found || searchResults.data[0];
        }
    } catch (searchError) {}
    return null;
}

async function reportPreviousTrackState(tokenInfoToUse) {
    if (currentPlayingTrackInfo) {
        const prevTrack = currentPlayingTrackInfo;
        currentPlayingTrackInfo = null; 

        if (prevTrack.progressTimerId) {
            clearInterval(prevTrack.progressTimerId);
        }

        const playedTicks = prevTrack.playedDurationSeconds * 10000000;
        const userIdForReport = prevTrack.userId || (tokenInfoToUse && tokenInfoToUse.userId);
        
        if (!userIdForReport) return;

        try {
            if (prevTrack.totalDurationSeconds > 0 && prevTrack.playedDurationSeconds >= prevTrack.totalDurationSeconds - 2) {
                await markEmbyItemPlayed(prevTrack.id, userIdForReport);
            } else {
                 const playbackStopInfo = {
                    ItemId: prevTrack.id,
                    MediaSourceId: prevTrack.mediaSourceId,
                    PositionTicks: playedTicks,
                    PlaySessionId: prevTrack.playSessionId,
                    NextMediaType: "Audio" 
                };
                await httpEmby('POST', '/Sessions/Playing/Stopped', {}, playbackStopInfo);
            }
        } catch (e) {}
    }
}

function formatEmbyTrackEventsToLrc(trackEventsData) {
    if (!trackEventsData || !trackEventsData.TrackEvents || !Array.isArray(trackEventsData.TrackEvents)) {
        return null;
    }

    let lrcLines = [];
    trackEventsData.TrackEvents.forEach(function(event) {
        const startTicks = event.StartPositionTicks || 0;
        const text = event.Text || "";

        const secondsTotal = startTicks / 10000000.0;
        
        const minutes = Math.floor(secondsTotal / 60);
        const seconds = Math.floor(secondsTotal % 60);
        const centiseconds = Math.floor((secondsTotal - Math.floor(secondsTotal)) * 100);

        const lrcTime = `[${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}]`;
        lrcLines.push(`${lrcTime}${text}`);
    });
    
    return lrcLines.join('\n');
}

async function getLyricApi(musicItem) {
    const tokenInfo = await getEmbyToken();
    const userVars = getUserVariables();
    const embyBaseUrl = userVars.url;

    if (tokenInfo && tokenInfo.userId && embyBaseUrl && musicItem && musicItem.id) {
        try {
            const itemDetailsParams = {
                UserId: tokenInfo.userId,
                Fields: 'MediaSources,MediaStreams'
            };
            const itemDetailsResult = await httpEmby('GET', `Users/${tokenInfo.userId}/Items/${musicItem.id}`, itemDetailsParams);

            if (itemDetailsResult && itemDetailsResult.data) {
                const itemData = itemDetailsResult.data;
                let mediaSourceId = null;
                let subtitleIndex = null;

                if (itemData.MediaSources && itemData.MediaSources.length > 0) {
                    const preferredSource = itemData.MediaSources.find(function(s) { return !s.IsInfiniteStream; }) || itemData.MediaSources[0];
                    if (preferredSource) mediaSourceId = preferredSource.Id;
                }
                
                if (itemData.MediaStreams) {
                    const lrcStream = itemData.MediaStreams.find(function(s) {
                        if (s.Type !== 'Subtitle' || !s.Codec) return false;
                            const codec = s.Codec.toLowerCase();
                            if (codec === 'lrc') {
                                return true;
                            }
                            if (codec === 'text' && s.Title === 'Lyrics') {
                                return true;
                            }
                        return false;
                    });
                    if (lrcStream) {
                        subtitleIndex = lrcStream.Index;
                    }
                }

                if (mediaSourceId && subtitleIndex !== null) {
                    const streamJsPath = `/Items/${musicItem.id}/${mediaSourceId}/Subtitles/${subtitleIndex}/Stream.js`;
                    const streamJsUrl = `${normalizeUrl(embyBaseUrl)}${streamJsPath}`;
                    
                    const queryParams = {
                        'MediaBrowser Client': EMBY_CLIENT_NAME, 
                        'Device': EMBY_DEVICE_NAME,
                        'DeviceId': globalEmbyDeviceId,
                        'Version': EMBY_APP_VERSION,
                        'Token': tokenInfo.token
                    };
                    const queryString = qs.stringify(queryParams);
                    const headers = {
                        'X-Emby-Authorization': `Emby Client="${EMBY_CLIENT_NAME}", Device="${EMBY_DEVICE_NAME}", DeviceId="${globalEmbyDeviceId}", Version="${EMBY_APP_VERSION}", Token="${tokenInfo.token}"`,
                        'Accept': 'application/json, text/javascript, */*',
                        'User-Agent': getUserAgent()
                    };
                    
                    try {
                        const streamResponse = await axios.get(`${streamJsUrl}?${queryString}`, { headers: headers, timeout: 10000 });
                        
                        if (streamResponse.data && streamResponse.data.TrackEvents) {
                            const lrcContent = formatEmbyTrackEventsToLrc(streamResponse.data);
                            if (lrcContent) {
                                return { rawLrc: he.decode(lrcContent) };
                            }
                        }
                    } catch (streamError) {}
                }
            }
        } catch (itemDetailsError) {}

        try {
            const lyricDataResult = await httpEmby('GET', `Items/${musicItem.id}/Lyrics`, { UserId: tokenInfo.userId });
            if (lyricDataResult && lyricDataResult.data) {
                const lyricData = lyricDataResult.data;
                if (lyricData && lyricData.Lyrics && lyricData.Lyrics.length > 0) {
                    const lrcLyric = lyricData.Lyrics.find(function(l) { return l.Format && l.Format.toLowerCase() === 'lrc' && l.Type === 'Lyric'; });
                    if (lrcLyric && lrcLyric.Text) return { rawLrc: he.decode(lrcLyric.Text) };
                }
            }
        } catch (e) {}
    }

    if (!musicItem.title) return null;
    try {
        let queryParams = [];
        queryParams.push(`title=${encodeURIComponent(musicItem.title)}`);
        
        const artist = musicItem.artist;
        if (artist && !['unknown artist', 'various artists'].includes(artist.toLowerCase())) {
            queryParams.push(`artist=${encodeURIComponent(artist)}`);
        }
        const album = musicItem.album;
        if (album && !['unknown album'].includes(album.toLowerCase())) {
            queryParams.push(`album=${encodeURIComponent(album)}`);
        }

        const response = await axios.get(`${LYRICS_API_BASE_URL}/lyrics?${queryParams.join('&')}`, {
            responseType: 'text', timeout: 10000, headers: { 'User-Agent': EXTERNAL_API_USER_AGENT }
        });

        if (response.data && typeof response.data === 'string' && response.data.trim()) {
            if (!response.data.toLowerCase().includes('not found') && response.data.length > 10) {
                return { rawLrc: he.decode(response.data) };
            }
        }
    } catch (e) {}
    return null;
}

async function getMusicInfoApi(musicItem) {
    if (musicItem.artwork) {
        return { artwork: musicItem.artwork };
    }
    return null;
}

async function getRecommendSheetTagsApi() {
    let tags = [{ id: 'music', title: '音乐' }];
    if (shouldShowAudiobooks()) {
        tags.push({ id: 'audiobooks', title: '有声书' });
    }
    return {
        pinned: tags,
        data: []
    };
}

async function getRecommendSheetsByTagApi(tag, page) {
    const tokenInfo = await getEmbyToken();
    if (!tokenInfo) return { isEnd: true, data: [] };

    const libs = await getLibraryIds();
    const musicLibraryId = libs.musicLibraryId;
    const audiobooksLibraryId = libs.audiobooksLibraryId;

    let targetLibraryId;
    let isMusicTab = false;

    if (!tag || !tag.id || tag.id === 'music') {
        targetLibraryId = musicLibraryId;
        isMusicTab = true;
    } else if (tag.id === 'audiobooks' && shouldShowAudiobooks()) {
        targetLibraryId = audiobooksLibraryId;
    } else {
        targetLibraryId = musicLibraryId;
        isMusicTab = true;
    }

    if (!targetLibraryId) {
        return { isEnd: true, data: [] };
    }

    const ownerUsername = (embyUserDetailsCache && embyUserDetailsCache.Name) ? embyUserDetailsCache.Name : "Emby 用户";
    let combinedData = [];
    let isPlaylistsEnd = true;

    let startIndexForPlaylists = (page - 1) * PAGE_SIZE;
    let limitForPlaylists = PAGE_SIZE;

    if (isMusicTab && page === 1) {
        const totalSongsCountResult = await httpEmby('GET', `Users/${tokenInfo.userId}/Items`, {
            ParentId: musicLibraryId, IncludeItemTypes: 'Audio', Recursive: true, Limit: 0
        });
        const totalSongsCount = (totalSongsCountResult && totalSongsCountResult.totalCount) || 0;

        const allSongsSheet = {
            id: ALL_SONGS_SHEET_INSTANCE_ID,
            _parentId: musicLibraryId,
            title: '所有歌曲',
            worksNum: totalSongsCount,
            artist: ownerUsername,
            artwork: ALL_SONGS_FIXED_ARTWORK_URL,
            description: `此媒体库中的所有歌曲 (${totalSongsCount} 首)`
        };
        combinedData.push(allSongsSheet);
        limitForPlaylists--;
        startIndexForPlaylists = 0;
    } else if (isMusicTab) {
        startIndexForPlaylists = (page - 1) * PAGE_SIZE - 1;
    }

    if (limitForPlaylists > 0) {
        const playlistParams = {
            ParentId: targetLibraryId,
            IncludeItemTypes: 'Playlist',
            Recursive: true,
            UserId: tokenInfo.userId,
            StartIndex: startIndexForPlaylists,
            Limit: limitForPlaylists,
            Fields: 'PrimaryImageAspectRatio,Overview,ImageTags,UserData,ChildCount,DateCreated'
        };
        const playlistResult = await httpEmby('GET', `Users/${tokenInfo.userId}/Items`, playlistParams);

        if (playlistResult && playlistResult.data && playlistResult.data.Items) {
            const playlists = playlistResult.data.Items;
            const totalPlaylists = playlistResult.totalCount || 0;
            isPlaylistsEnd = (playlistParams.StartIndex + playlists.length) >= totalPlaylists;
            
            const formattedPlaylistsPromises = playlists.map(function(item) {
                return (async function() {
                    let firstSongInfoHint = null;
                    if (!(item.ImageTags && item.ImageTags.Primary) && item.ChildCount > 0) {
                        try {
                            const itemsResult = await httpEmby('GET', `Playlists/${item.Id}/Items`, { UserId: tokenInfo.userId, Limit: 1, Fields: 'PrimaryImageAspectRatio,AlbumPrimaryImageTag,ImageTags,AlbumId,RunTimeTicks' });
                            if (itemsResult && itemsResult.data && itemsResult.data.Items && itemsResult.data.Items[0]) {
                                const firstItemFormatted = await formatMusicItem(itemsResult.data.Items[0]);
                                firstSongInfoHint = { artwork: firstItemFormatted.artwork };
                            }
                        } catch (e) {}
                    }
                    const sheet = formatSheetItem(item, ownerUsername, firstSongInfoHint);
                    sheet._parentId = targetLibraryId;
                    return sheet;
                })();
            });
            const formattedPlaylists = await Promise.all(formattedPlaylistsPromises);
            combinedData.push.apply(combinedData, formattedPlaylists);
        }
    }

    return {
        isEnd: isPlaylistsEnd,
        data: combinedData
    };
}

async function getTopListsApi() {
    let topLists = [
        {
            title: "音乐",
            data: [
                { id: 'music_emby_toplist_favoritemusic', title: '我的收藏', platform: '南瓜' },
                { id: 'music_emby_toplist_randommusic', title: '随机播放', platform: '南瓜' },
                { id: 'music_emby_toplist_recently_added_music', title: '最新添加', platform: '南瓜' },
                { id: 'music_emby_toplist_most_played_music', title: '播放最多', platform: '南瓜' },
                { id: 'music_emby_toplist_recently_played_music', title: '最近播放', platform: '南瓜' },
            ]
        }
    ];

    if (shouldShowAudiobooks()) {
        topLists.push({
            title: "有声书",
            data: [
                { id: 'audiobook_emby_toplist_favoritemusic', title: '我的收藏', platform: '南瓜' },
                { id: 'audiobook_emby_toplist_recently_played_music', title: '最近播放', platform: '南瓜' },
            ]
        });
    }

    return topLists;
}

async function getTopListDetailApi(topListItem, page) {
    const tokenInfo = await getEmbyToken();
    if (!tokenInfo) return { isEnd: true, musicList: [] };

    const libs = await getLibraryIds();
    const musicLibraryId = libs.musicLibraryId;
    const audiobooksLibraryId = libs.audiobooksLibraryId;
    
    const idParts = topListItem.id.split('_');
    const libraryType = idParts[0];
    const actualId = idParts.slice(1).join('_');
    
    let parentId = null;
    if (libraryType === 'music') {
        parentId = musicLibraryId;
    } else if (libraryType === 'audiobook' && shouldShowAudiobooks()) {
        parentId = audiobooksLibraryId;
    }
    
    if (!parentId) {
        return { isEnd: true, musicList: [] };
    }

    const params = {
        UserId: tokenInfo.userId,
        IncludeItemTypes: 'Audio',
        Recursive: true,
        ParentId: parentId,
        StartIndex: (page - 1) * PAGE_SIZE,
        Limit: PAGE_SIZE,
        Fields: 'PrimaryImageAspectRatio,MediaSources,Path,Album,AlbumId,ArtistItems,AlbumArtist,RunTimeTicks,ProviderIds,ImageTags,UserData,DateCreated,CommunityRating,AlbumPrimaryImageTag,PlayCount,DatePlayed'
    };

    switch (actualId) {
        case 'emby_toplist_favoritemusic':
            params.Filters = 'IsFavorite';
            params.SortBy = 'SortName';
            params.SortOrder = 'Ascending';
            break;
        case 'emby_toplist_randommusic':
            params.SortBy = 'Random';
            break;
        case 'emby_toplist_recently_added_music':
            params.SortBy = 'DateCreated';
            params.SortOrder = 'Descending';
            break;
        case 'emby_toplist_most_played_music':
            params.SortBy = 'PlayCount';
            params.SortOrder = 'Descending';
            break;
        case 'emby_toplist_recently_played_music':
            params.SortBy = 'DatePlayed';
            params.SortOrder = 'Descending';
            break;
        default:
            return { isEnd: true, musicList: [] };
    }

    try {
        const endpoint = `Users/${tokenInfo.userId}/Items`;
        const result = await httpEmby('GET', endpoint, params);
        if (!result || !result.data) return { isEnd: true, musicList: [] };

        const items = result.data.Items ? result.data.Items : [];
        const totalCount = result.totalCount !== undefined ? result.totalCount : items.length;
        const musicListPromises = items.map(function(item) { return formatMusicItem(item); });
        const musicList = await Promise.all(musicListPromises);
        
        let updatedTopListItem;
        if (page === 1) {
            updatedTopListItem = Object.assign({}, topListItem);
        }

        return {
            isEnd: (params.StartIndex + musicList.length) >= totalCount,
            musicList: musicList,
            topListItem: updatedTopListItem 
        };
    } catch(e) {
        return { isEnd: true, musicList: [] };
    }
}

function formatQQImportItem(qqSong) {
    const album = qqSong.album;
    const albummid = qqSong.albummid || (album && album.mid);
    const albumname = qqSong.albumname || (album && album.title);
    
    return {
        id: `qq-tmp-${String(qqSong.id || qqSong.songid)}`,
        songmid: qqSong.mid || qqSong.songmid,
        title: he.decode(String(qqSong.title || qqSong.songname)),
        artist: Array.isArray(qqSong.singer) ? qqSong.singer.map(function(s){ return he.decode(s.name); }).join("/") : "未知艺术家",
        album: he.decode(String(albumname || '')),
        artwork: albummid ? `https://y.gtimg.cn/music/photo_new/T002R800x800M000${albummid}.jpg` : undefined,
        duration: qqSong.interval,
        albummid: albummid,
        _qqId: String(qqSong.id || qqSong.songid)
    };
}

function formatNcmMusicItem(ncmSong) {
    const album = ncmSong.al || ncmSong.album;
    const artists = ncmSong.ar || ncmSong.artists;
    let durationSeconds;
    if (ncmSong.duration !== undefined) {
        durationSeconds = Math.round(ncmSong.duration / 1000);
    } else if (ncmSong.dt !== undefined) {
        durationSeconds = Math.round(ncmSong.dt / 1000);
    }

    return {
        id: `ncm-tmp-${String(ncmSong.id)}`,
        title: he.decode(String(ncmSong.name || "未知歌曲")),
        artist: (Array.isArray(artists) && artists.length > 0) ? artists.map(function(a) { return he.decode(a.name); }).join('/') : "未知艺术家",
        album: he.decode(String((album && album.name) || "未知专辑")),
        artwork: album && album.picUrl ? album.picUrl : undefined,
        duration: durationSeconds,
        _ncmId: String(ncmSong.id)
    };
}

async function getQQPlaylistDetails(id) {
    try {
        const resultText = (await axios({
            url: `http://i.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg?type=1&utf8=1&disstid=${id}&loginUin=0`,
            headers: { Referer: "https://y.qq.com/n/yqq/playlist", "User-Agent": EXTERNAL_API_USER_AGENT, Cookie: "uin=" },
            method: "get",
            timeout: 15000
        })).data;
        const jsonString = resultText.replace(/^callback\(|^MusicJsonCallback\(|^jsonCallback\(|\)$/g, "");
        const res = JSON.parse(jsonString);
        if (!res.cdlist || res.cdlist.length === 0) return { name: `QQ 音乐歌单 ${id}`, songs: [] };
        
        const playlistData = res.cdlist[0];
        const name = he.decode(playlistData.dissname || `QQ 音乐歌单 ${id}`);
        const songs = (playlistData.songlist || []).map(formatQQImportItem);
        return { name: name, songs: songs };
    } catch (e) {
        return { name: `QQ 音乐歌单 ${id}`, songs: [] };
    }
}

async function getNcmTrackDetails(trackIds) {
    if (!trackIds || trackIds.length === 0) return [];
    const ncmHeaders = { Referer: "https://music.163.com/", Origin: "https://music.163.com/", "User-Agent": EXTERNAL_API_USER_AGENT };
    const apiUrl = `https://music.163.com/api/song/detail/?ids=[${trackIds.join(",")}]`;
    try {
        const response = await axios.get(apiUrl, { headers: ncmHeaders, timeout: 15000 });
        if (response.data && response.data.songs && response.data.songs.length > 0) {
            return response.data.songs.map(formatNcmMusicItem);
        }
        return [];
    } catch (e) {
        return [];
    }
}

async function getNcmPlaylistDetails(id) {
    const ncmHeaders = { Referer: "https://music.163.com/", Origin: "https://music.163.com/", "User-Agent": EXTERNAL_API_USER_AGENT };
    const apiUrl = `https://music.163.com/api/v3/playlist/detail?id=${id}&n=100000`;
    try {
        const response = await axios.get(apiUrl, { headers: ncmHeaders, timeout: 15000 });
        const playlistData = response.data && response.data.playlist;
        if (playlistData && playlistData.trackIds) {
            const trackIds = playlistData.trackIds.map(function(_) { return _.id; });
            const name = he.decode(playlistData.name || `网易云歌单 ${id}`);
            return { trackIds: trackIds, name: name };
        } else {
            return { trackIds: [], name: `网易云歌单 ${id}` };
        }
    } catch (e) {
        return { trackIds: [], name: `网易云歌单 ${id}` };
    }
}

async function findAndMatchTrackOnEmby(externalTrack, source) {
    const cleanedTitle = (externalTrack.title || '').replace(/(?:\s*[(（\[【].*?[)）\]】]\s*)$/, '');
    const query = `${cleanedTitle} ${externalTrack.artist || ''}`.trim();
    const MAX_SEARCH_CANDIDATES = source === 'qq' ? QQ_MATCH_CANDIDATES_LIMIT : NCM_MATCH_CANDIDATES_LIMIT;

    try {
        let searchResult = await searchMusicInternal(query, 1, MAX_SEARCH_CANDIDATES);
        let potentialTracks = (searchResult && searchResult.data) ? searchResult.data : [];

        if (potentialTracks.length === 0 && externalTrack.artist) {
            const titleOnlyResult = await searchMusicInternal(cleanedTitle, 1, MAX_SEARCH_CANDIDATES);
            potentialTracks = (titleOnlyResult && titleOnlyResult.data) ? titleOnlyResult.data : [];
        }
        if (potentialTracks.length === 0) return null;

        let bestMatch = null;
        let bestScore = -1;

        const normalizedExternalTitle = normalize(cleanedTitle);
        const normalizedExternalArtist = normalize(externalTrack.artist);
        const externalDuration = externalTrack.duration;

        for (let i = 0; i < potentialTracks.length; i++) {
            const embyTrack = potentialTracks[i];
            let currentScore = 0;
            const normalizedEmbyTitle = normalize(embyTrack.title);
            const normalizedEmbyArtist = normalize(embyTrack.artist);
            const embyDuration = embyTrack.duration;

            if (normalizedEmbyTitle === normalizedExternalTitle) {
                currentScore += 10;
            } else {
                continue; 
            }

            if (normalizedExternalArtist) {
                if (normalizedEmbyArtist === normalizedExternalArtist) {
                    currentScore += 5;
                } else if ( (normalizedEmbyArtist && normalizedEmbyArtist.includes(normalizedExternalArtist)) || 
                            (normalizedExternalArtist && normalizedExternalArtist.includes(normalizedEmbyArtist)) ) {
                    currentScore += 2;
                }
            } else {
                currentScore += 1;
            }

            if (externalDuration && embyDuration) {
                if (Math.abs(embyDuration - externalDuration) <= DURATION_TOLERANCE_SECONDS) {
                    currentScore += 3;
                } else if (Math.abs(embyDuration - externalDuration) <= DURATION_TOLERANCE_SECONDS * 2) {
                    currentScore +=1;
                }
            } else {
                currentScore += 1;
            }

            if (currentScore > bestScore) {
                bestScore = currentScore;
                bestMatch = embyTrack;
            }
        }

        if (bestMatch && bestScore >= 12) {
            let result = Object.assign({}, bestMatch);
            result.artwork = externalTrack.artwork || bestMatch.artwork; 
            result._source = `emby_${source}_import`;
            return result;
        }
        return null;

    } catch (e) {
         return null;
    }
}

async function processQQPlaylistImport(id) {
    const qqDetails = await getQQPlaylistDetails(id);
    const qqPlaylistName = qqDetails.name;
    const qqTracks = qqDetails.songs;

    if (!qqTracks || qqTracks.length === 0) {
        return { playlistName: qqPlaylistName || `QQ 歌单 ${id}`, matchedTracks: [] };
    }

    const matchedEmbyTracks = [];
    const promisesInFlight = [];

    for (let i = 0; i < qqTracks.length; i++) {
        const qqTrack = qqTracks[i];

        const promise = findAndMatchTrackOnEmby(qqTrack, 'qq')
            .then(function(track) { if (track) matchedEmbyTracks.push(track); })
            .catch(function(e) {});
        promisesInFlight.push(promise);

        if (promisesInFlight.length >= QQ_IMPORT_CONCURRENCY || i === qqTracks.length - 1) {
            await Promise.all(promisesInFlight);
            promisesInFlight.length = 0;
        }
    }
    return { playlistName: qqPlaylistName, matchedTracks: deduplicateTracks(matchedEmbyTracks) };
}

async function processNcmPlaylistImport(id) {
    const ncmDetails = await getNcmPlaylistDetails(id);
    const ncmPlaylistName = ncmDetails.name;
    const trackIds = ncmDetails.trackIds;

    if (!trackIds || trackIds.length === 0) {
        return { playlistName: ncmPlaylistName || `网易云歌单 ${id}`, matchedTracks: [] };
    }
    
    let ncmTracks = [];
    const batchSizeNcm = 200;
    for (let i = 0; i < trackIds.length; i += batchSizeNcm) {
        const batchIds = trackIds.slice(i, i + batchSizeNcm);
        const batchResult = await getNcmTrackDetails(batchIds);
        ncmTracks = ncmTracks.concat(batchResult);
    }

    const matchedEmbyTracks = [];
    const promisesInFlight = [];

    for (let i = 0; i < ncmTracks.length; i++) {
        const ncmTrack = ncmTracks[i];
        if (!ncmTrack || !ncmTrack.title) continue;

        const promise = findAndMatchTrackOnEmby(ncmTrack, 'ncm')
            .then(function(track) { if (track) matchedEmbyTracks.push(track); })
            .catch(function(e) {});
        promisesInFlight.push(promise);

        if (promisesInFlight.length >= NCM_IMPORT_CONCURRENCY || i === ncmTracks.length - 1) {
            await Promise.all(promisesInFlight);
            promisesInFlight.length = 0;
        }
    }
    return { playlistName: ncmPlaylistName, matchedTracks: deduplicateTracks(matchedEmbyTracks) };
}

async function createEmbyPlaylistApi(name) {
    const tokenInfo = await getEmbyToken();
    if (!tokenInfo) return null;

    const body = {
        Name: name,
        UserId: tokenInfo.userId,
        MediaType: "Audio"
    };
    try {
        const playlistCreationResult = await httpEmby('POST', 'Playlists', {}, body);
        if (playlistCreationResult && playlistCreationResult.data && playlistCreationResult.data.Id) {
            return playlistCreationResult.data.Id;
        }
        const playlistsDataResult = await httpEmby('GET', `Users/${tokenInfo.userId}/Items`, {
            IncludeItemTypes: 'Playlist', Recursive: true, UserId: tokenInfo.userId, Fields: 'Name'
        });
        if (playlistsDataResult && playlistsDataResult.data) {
            const playlistsData = playlistsDataResult.data;
            const foundPlaylist = (playlistsData.Items || []).find(function(p) { return p.Name === name; });
            if (foundPlaylist) return foundPlaylist.Id;
        }
        return null;
    } catch (error) {
         return null;
    }
}

async function addSongsToEmbyPlaylistApi(playlistId, songIds) {
    if (!playlistId || !songIds || songIds.length === 0) return false;
    const tokenInfo = await getEmbyToken();
    if (!tokenInfo) return false;

    try {
        const idsString = songIds.map(String).join(',');
        const result = await httpEmby('POST', `Playlists/${playlistId}/Items`, { Ids: idsString, UserId: tokenInfo.userId });
        return !!result;
    } catch (error) {
        return false;
    }
}

module.exports = {
    platform: "南瓜",
    version: EMBY_APP_VERSION,
    author: 'Ckryin',
    srcUrl: "https://gitee.com/Rrance/WP/raw/master/南瓜_emby.js",
    cacheControl: "no-cache",
    userVariables: [
        { key: "url", name: "Emby 服务器地址 (URL)", description: "例如：http://192.168.1.100:8096" },
        { key: "username", name: "Emby 用户名" },
        { key: "password", name: "Emby 密码", type: "password" },
        { key: "deviceId", name: "Emby 设备ID (可选,留空自动生成)", defaultValue: "" },
        { key: "showAudiobooks", name: "是否显示有声书 (yes/no)", defaultValue: "no" },
        { key: "uploadPlaylist", name: "导入歌单时上传到Emby (yes/no)", defaultValue: "no" }
    ],
    supportedSearchType: ["music", "album", "sheet", "artist"],
    primaryKey: ["id"],
    hints: {
        importMusicSheet: [
            "支持 QQ 音乐或网易云歌单分享链接/纯数字ID。",
            "格式示例: qq:歌单ID, ncm:歌单ID, 或直接粘贴链接/ID。",
            "若开启“上传歌单到Emby”，同名歌单将被覆盖。",
            "导入耗时取决于歌单大小及网络，可能需数分钟。",
            "仅成功匹配的歌曲会被导入。"
        ],
        importMusicItem: []
    },

    async search(query, page, type) {
        try {
            if (type === "music") return await searchMusicInternal(query, page);
            if (type === "album") return await searchAlbumInternal(query, page);
            if (type === "sheet") return await searchPlaylistsInternal(query, page);
            if (type === "artist") return await searchArtistInternal(query, page);
            return { isEnd: true, data: [] };
        } catch (e) {
            return { isEnd: true, data: [] };
        }
    },

    async getAlbumInfo(albumItem, page) {
        try {
            return await getAlbumInfoApi(albumItem, page);
        } catch (e) {
            return { isEnd: true, musicList: [] };
        }
    },

    async getMusicSheetInfo(sheetItem, page) {
        try {
            return await getMusicSheetInfoApi(sheetItem, page);
        } catch (e) {
            return { isEnd: true, musicList: [] };
        }
    },

    async getArtistWorks(artistItem, page, type) {
        try {
            return await getArtistWorksApi(artistItem, page, type);
        } catch (e) {
            return { isEnd: true, data: [] };
        }
    },

    async getMediaSource(musicItem, quality) {
        const userVars = getUserVariables();
        const embyBaseUrl = userVars.url;
        if (!embyBaseUrl) return null;

        const tokenInfo = await getEmbyToken();
        if (!tokenInfo) return null;

        await reportPreviousTrackState(tokenInfo);

        const playbackInfoRequestBody = {
            UserId: tokenInfo.userId,
            Id: musicItem.id,
            EnableDirectPlay: true,
            EnableDirectStream: true,
            AllowVideoStreamCopy: true,
            AllowAudioStreamCopy: true,
            IsPlayback: true,
            AutoOpenLiveStream: false
        };

        let playbackData;
        let sourceToPlay;
        let streamUrl;

        try {
            const playbackDataResult = await httpEmby('POST', `Items/${musicItem.id}/PlaybackInfo`, {}, playbackInfoRequestBody);
            if (!playbackDataResult || !playbackDataResult.data) {
                const fixedItem = await tryAutoFixMusicId(musicItem);
                if (fixedItem && fixedItem.id !== musicItem.id) {
                    const newItemData = Object.assign({}, musicItem, {
                        id: fixedItem.id,
                        _source: (fixedItem._source || 'emby'),
                        duration: fixedItem.duration,
                        _runTimeTicks: fixedItem._runTimeTicks
                    });
                    return this.getMediaSource(newItemData, quality);
                }
                return null;
            }
            playbackData = playbackDataResult.data;

            if (!playbackData.MediaSources || playbackData.MediaSources.length === 0) {
                return null;
            }

            sourceToPlay =
                playbackData.MediaSources.find(function(s) { return s.SupportsDirectPlay && !s.IsInfiniteStream; }) ||
                playbackData.MediaSources.find(function(s) { return s.SupportsDirectStream && !s.IsInfiniteStream; }) ||
                playbackData.MediaSources.find(function(s) { return !s.IsInfiniteStream; }) ||
                playbackData.MediaSources[0];

            if (!sourceToPlay) {
                return null;
            }

            if (sourceToPlay.DirectStreamUrl) {
                streamUrl = sourceToPlay.DirectStreamUrl.startsWith('http') ? sourceToPlay.DirectStreamUrl : `${normalizeUrl(embyBaseUrl)}/${sourceToPlay.DirectStreamUrl.replace(/^\//, '')}`;
            } else if (sourceToPlay.TranscodingUrl) {
                streamUrl = sourceToPlay.TranscodingUrl.startsWith('http') ? sourceToPlay.TranscodingUrl : `${normalizeUrl(embyBaseUrl)}/${sourceToPlay.TranscodingUrl.replace(/^\//, '')}`;
            } else if (sourceToPlay.Path && (sourceToPlay.SupportsDirectPlay || sourceToPlay.SupportsDirectStream)) {
                const suffix = musicItem.suffix || sourceToPlay.Container || 'mp3';
                streamUrl = `${normalizeUrl(embyBaseUrl)}/Audio/${musicItem.id}/stream.${suffix}?Static=true&MediaSourceId=${sourceToPlay.Id}&DeviceId=${globalEmbyDeviceId}&api_key=${tokenInfo.token}`;
            } else {
                streamUrl = `${normalizeUrl(embyBaseUrl)}/Audio/${musicItem.id}/stream?Static=true&MediaSourceId=${sourceToPlay.Id}&DeviceId=${globalEmbyDeviceId}&api_key=${tokenInfo.token}`;
            }

            if (streamUrl && !streamUrl.includes('api_key=') && !streamUrl.includes('TranscodingUrl=') && !streamUrl.includes('DirectStreamUrl=')) {
                if (streamUrl.includes(`/Audio/${musicItem.id}/stream`)) {
                    streamUrl += (streamUrl.includes('?') ? '&' : '?') + `api_key=${tokenInfo.token}`;
                }
            }

        } catch (error) {
            const fixedItem = await tryAutoFixMusicId(musicItem);
            if (fixedItem && fixedItem.id !== musicItem.id) {
                const newItemData = Object.assign({}, musicItem, {
                    id: fixedItem.id,
                    _source: (fixedItem._source || 'emby'),
                    duration: fixedItem.duration,
                    _runTimeTicks: fixedItem._runTimeTicks
                });
                return this.getMediaSource(newItemData, quality);
            }
            return null;
        }

        const mediaSourceId = sourceToPlay.Id;
        const playSessionId = playbackData.PlaySessionId || CryptoJS.MD5(Date.now().toString() + musicItem.id).toString();

        const playbackStartInfo = {
            ItemId: musicItem.id,
            MediaSourceId: mediaSourceId,
            CanSeek: true,
            PlaySessionId: playSessionId,
            PlayMethod: sourceToPlay.SupportsDirectPlay ? 'DirectPlay' : (sourceToPlay.SupportsDirectStream ? 'DirectStream' : 'Transcode')
        };

        try {
            await httpEmby('POST', '/Sessions/Playing', {}, playbackStartInfo);
        } catch (e) {}

        const totalDurationSeconds = musicItem.duration ||
            (sourceToPlay.RunTimeTicks ? Math.round(sourceToPlay.RunTimeTicks / 10000000) : 0) ||
            (musicItem._runTimeTicks ? Math.round(musicItem._runTimeTicks / 10000000) : 0);

        currentPlayingTrackInfo = {
            id: musicItem.id,
            title: musicItem.title,
            totalDurationSeconds: totalDurationSeconds,
            playedDurationSeconds: 0,
            progressTimerId: null,
            mediaSourceId: mediaSourceId,
            playSessionId: playSessionId,
            userId: tokenInfo.userId
        };

        if (totalDurationSeconds > 0) {
            const timerId = setInterval(function() {
                (async function() {
                    if (!currentPlayingTrackInfo || currentPlayingTrackInfo.id !== musicItem.id || currentPlayingTrackInfo.progressTimerId !== timerId) {
                        clearInterval(timerId);
                        return;
                    }

                    currentPlayingTrackInfo.playedDurationSeconds += (PLAYED_DURATION_INCREMENT_INTERVAL_MS / 1000);

                    if (Math.floor(currentPlayingTrackInfo.playedDurationSeconds * 1000) % PROGRESS_REPORT_INTERVAL_MS < PLAYED_DURATION_INCREMENT_INTERVAL_MS) {
                        const playbackProgressInfo = {
                            ItemId: currentPlayingTrackInfo.id,
                            MediaSourceId: currentPlayingTrackInfo.mediaSourceId,
                            PositionTicks: Math.round(currentPlayingTrackInfo.playedDurationSeconds * 10000000),
                            PlaySessionId: currentPlayingTrackInfo.playSessionId,
                            IsPaused: false,
                            IsMuted: false,
                            EventName: "TimeUpdate"
                        };
                        try {
                            const reportSuccess = await httpEmby('POST', '/Sessions/Playing/Progress', {}, playbackProgressInfo);
                            if (!reportSuccess) {
                                if (currentPlayingTrackInfo && currentPlayingTrackInfo.progressTimerId) {
                                    clearInterval(currentPlayingTrackInfo.progressTimerId);
                                    currentPlayingTrackInfo.progressTimerId = null;
                                }
                            }
                        } catch (e) {
                            if (currentPlayingTrackInfo && currentPlayingTrackInfo.progressTimerId) {
                                clearInterval(currentPlayingTrackInfo.progressTimerId);
                                currentPlayingTrackInfo.progressTimerId = null;
                            }
                        }
                    }

                    if (currentPlayingTrackInfo.playedDurationSeconds >= currentPlayingTrackInfo.totalDurationSeconds) {
                        if (currentPlayingTrackInfo.progressTimerId) {
                            clearInterval(currentPlayingTrackInfo.progressTimerId);
                            currentPlayingTrackInfo.progressTimerId = null;
                        }
                    }
                })();
            }, PLAYED_DURATION_INCREMENT_INTERVAL_MS);
            currentPlayingTrackInfo.progressTimerId = timerId;
        }

        return { url: streamUrl };
    },

    async getLyric(musicItem) {
        try {
            return await getLyricApi(musicItem);
        } catch (e) {
            return null;
        }
    },

    async getMusicInfo(musicItem) {
        try {
            return await getMusicInfoApi(musicItem);
        } catch (e) {
            return null;
        }
    },

    async getRecommendSheetTags() {
        try {
            return await getRecommendSheetTagsApi();
        } catch (e) {
            return { pinned: [], data: [] };
        }
    },

    async getRecommendSheetsByTag(tag, page) {
        try {
            return await getRecommendSheetsByTagApi(tag, page);
        } catch (e) {
            return { isEnd: true, data: [] };
        }
    },

    async importMusicSheet(urlLike) {
        const userVars = getUserVariables();
        const shouldUpload = userVars.uploadPlaylist === 'yes';
        let playlistName = "";
        let matchedTracks = [];

        try {
            const token = await getEmbyToken();
            if (!token) return [];
        } catch (e) {
            return [];
        }

        const qqRegexList = [
            /https?:\/\/i\.y\.qq\.com\/n2\/m\/share\/details\/taoge\.html\?.*?id=([0-9]+)/i,
            /https?:\/\/y\.qq\.com\/n\/ryqq\/playlist\/([0-9]+)/i,
            /^qq:(\d+)$/i,
            /^(\d{8,12})$/
        ];
        const ncmPlaylistRegex = /(?:https?:\/\/y\.music\.163\.com\/(?:m\/)?playlist\?id=([0-9]+))|(?:https?:\/\/music\.163\.com\/(?:#\/)?playlist\?.*?id=(\d+)(?:&|$))|(?:^ncm:(\d+)$)|(?:^(\d{8,12})$)/i;

        let importError = false;
        let operationCompleted = false;

        for (let i = 0; i < qqRegexList.length; i++) {
            const regex = qqRegexList[i];
            const matchResult = urlLike.match(regex);
            if (matchResult && matchResult[1]) {
                try {
                    const result = await processQQPlaylistImport(matchResult[1]);
                    playlistName = result.playlistName;
                    matchedTracks = result.matchedTracks;
                    operationCompleted = true;
                } catch (e) {
                    importError = true;
                    if (regex.source !== "^(\\d{8,12})$") {
                        return [];
                    }
                }
                break;
            }
        }

        if (!operationCompleted) {
            const ncmMatchResult = urlLike.match(ncmPlaylistRegex);
            if (ncmMatchResult) {
                const id = ncmMatchResult[1] || ncmMatchResult[2] || ncmMatchResult[3] || ncmMatchResult[4];
                if (!id) {
                    return [];
                }
                try {
                    const result = await processNcmPlaylistImport(id);
                    playlistName = result.playlistName;
                    matchedTracks = result.matchedTracks;
                    operationCompleted = true;
                } catch (e) {
                    importError = true;
                }
            }
        }

        if (!operationCompleted) {
            return [];
        }
        if (importError && matchedTracks.length === 0) {
            return [];
        }

        if (shouldUpload && matchedTracks.length > 0 && playlistName) {
            const tokenInfo = await getEmbyToken();
            if (!tokenInfo) return matchedTracks;

            let existingPlaylistId = null;
            try {
                const playlistsResult = await httpEmby('GET', 'Users/' + tokenInfo.userId + '/Items', {
                    IncludeItemTypes: 'Playlist', Recursive: true, UserId: tokenInfo.userId, Fields: 'Name'
                });
                if (playlistsResult && playlistsResult.data) {
                    const existingPlaylist = (playlistsResult.data.Items || []).find(function(p) { return p.Name === playlistName; });
                    if (existingPlaylist) existingPlaylistId = existingPlaylist.Id;
                }
            } catch (e) {}

            if (existingPlaylistId) {
                try {
                    await httpEmby('DELETE', `Items/${existingPlaylistId}`);
                } catch (e) {}
            }

            const newEmbyPlaylistId = await createEmbyPlaylistApi(playlistName);
            if (newEmbyPlaylistId) {
                const embySongIdsToAdd = matchedTracks.map(function(track) { return track.id; }).filter(function(id) { return id; });
                if (embySongIdsToAdd.length > 0) {
                    await addSongsToEmbyPlaylistApi(newEmbyPlaylistId, embySongIdsToAdd);
                }
            }
        }
        return matchedTracks;
    },

    async getTopLists() {
        try {
            return await getTopListsApi();
        } catch (e) {
            return [];
        }
    },

    async getTopListDetail(topListItem, page) {
        try {
            return await getTopListDetailApi(topListItem, page);
        } catch (e) {
            return { isEnd: true, musicList: [] };
        }
    }
};