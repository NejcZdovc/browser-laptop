/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

const urlParse = require('../urlParse')
const queryString = require('querystring')
const request = require('request')
const appActions = require('../../../js/actions/appActions')
const ledgerVideoProviders = require('../constants/ledgerVideoProviders')

// General
const parseVideoRequest = (url) => {
  const parsedUrl = urlParse(url)
  let query = null

  if (parsedUrl && parsedUrl.query) {
    query = queryString.parse(parsedUrl.query)
  }

  if (query == null) {
    return
  }

  // Youtube handler
  if (url.includes('youtube.com/api')) {
    return {
      videoId: getYoutubeVideoKey(query),
      duration: getYoutubeDuration(query),
      type: 'video',
      provider: ledgerVideoProviders.YOUTUBE
    }
  }
}

const fetchVideoData = (data) => {
  switch (data.provider) {
    case ledgerVideoProviders.YOUTUBE:
      {
        getYoutubeData(data)
        break
      }
  }
}

// Youtube specific
const getYoutubeVideoKey = (query) => {
  if (query == null) {
    return null
  }

  return query.docid
}

const getYoutubePublisher = (url) => {
  if (url == null) {
    return null
  }

  const urlArray = url.split('/')
  return `yt-${urlArray[4]}`
}

const getYoutubeDuration = (query) => {
  let time = 0
  if (query == null || query.st == null || query.et == null) {
    return time
  }

  console.log('getYoutubeDuration', query.st, query.et)

  const startTime = query.st.split(',')
  const endTime = query.et.split(',')

  if (startTime.length !== endTime.length) {
    return time
  }

  for (let i = 0; i < startTime.length; i++) {
    time += parseInt(endTime[i]) - parseInt(startTime[i])
  }

  console.log('getYoutubeDuration time', time)

  // we get seconds back, so we need to convert it into ms
  time = time * 1000

  return time
}

const getYoutubeData = (data) => {
  const videoId = data.videoId
  if (videoId == null) {
    return null
  }

  const headers = {
    headers: {
      'User-Agent': 'node.js'
    }
  }

  request(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}`, headers, (error, response, body) => {
    if (error) {
      return
    }

    const parsed = JSON.parse(body)
    const publisherKey = getYoutubePublisher(parsed.author_url)
    const actionData = {
      name: parsed.author_name,
      duration: data.duration,
      videoId,
      publisherKey,
      provider: data.provider,
      type: data.type,
      faviconURL: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsSAAALEgHS3X78AAABDklEQVRYw+2X4Y2CQBSEv3e5ArgOKIEO3BK0A0uhBDsRO8AOtgMpYTuY+yErRL3cobLrJUwyISGEmWTfm/fWJJETH2TGYiC7gc+7b80KoALKngBu4r/b/tn19Ejh5itJA6EStALNxFZQjTWvxcOM4pFhbGJsoEkgHtlEXbsEkVnaRJJs6AKzMnn5nwv90obTDKzXr7BQPZ4D+z20LZRlxiBarcB7qOtna0EI3KQqvob3knNTO8ENbfisgYjdTiqKSQayz4J/fgQhSHX9aBo6ST9Mw7/geITtFrpuhnH8GzYbaJrXBKKkGMWnxOX3hRTeZBidcUgof7jdiLIvJJlWMrt7M0q4lNpyNVsM5DbwDTlqsJtbbh7VAAAAAElFTkSuQmCC'
    }

    appActions.onLedgerVideoQuery(actionData)
  })
}

module.exports = {
  parseVideoRequest,
  fetchVideoData
}
