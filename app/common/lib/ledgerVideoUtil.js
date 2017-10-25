/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

const urlParse = require('../urlParse')
const queryString = require('querystring')

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
    const data = getYoutubeData(query)

    return {
      publisherKey: getYoutubePublisher(data.channelId),
      duration: getYoutubeDuration(query),
      name: data.name,
      type: 'YouTube' // Move into constant
    }
  }
}

const getYoutubePublisher = (query) => {
  if (query == null) {
    return null
  }

  // TODO we need to convert video id into channel id
  return `yt-${query.docid}`
}

const getYoutubeDuration = (query) => {
  let time = 0
  if (query == null || query.st == null || query.et == null) {
    return time
  }

  const startTime = query.st.split(',')
  const endTime = query.et.split(',')

  if (startTime.length !== endTime.length) {
    return time
  }

  for (let i = 0; i < startTime.length; i++) {
    time += parseFloat(endTime[i]) - parseFloat(startTime[i])
  }

  // we get seconds back, so we need to convert it into ms
  time = time * 1000

  return time
}

const getYoutubeData = (query) => {
  // TODO
  // 0. get data from cache if exists
  // 1. query to get  https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ
  // 2. parse author_url to get channel id
  // 3. query author_name to get channel name
  // 4. cache this data into cache object in the state, which should be delete after you close brave
  if (query == null) {
    return null
  }

  const id = query.docid
  return {
    channelId: id,
    name: 'Test'
  }
}

module.exports = {
  parseVideoRequest
}
