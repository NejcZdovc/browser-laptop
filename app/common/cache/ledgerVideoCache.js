/* This Source Code Form is subject to the terms of the Mozilla Public * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

const Immutable = require('immutable')

const getDataByVideo = (state, key) => {
  if (key == null) {
    return Immutable.Map()
  }

  return state.getIn(['cache', 'ledgerVideos', key]) || Immutable.Map()
}

const setData = (state, key, data) => {
  if (key == null) {
    return state
  }

  return state.setIn(['cache', 'ledgerVideos', key], data)
}

module.exports = {
  getDataByVideo,
  setData
}
