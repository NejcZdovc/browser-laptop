/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

const Immutable = require('immutable')

// State
const bookmarkFoldersState = require('../../common/state/bookmarkFoldersState')

// Constants
const appConstants = require('../../../js/constants/appConstants')

// Utils
const {makeImmutable} = require('../../common/state/immutableUtil')
const syncUtil = require('../../../js/state/syncUtil')

const bookmarkFoldersReducer = (state, action, immutableAction) => {
  action = immutableAction || makeImmutable(action)
  switch (action.get('actionType')) {
    case appConstants.APP_ADD_BOOKMARK_FOLDER:
      {
        const closestKey = action.get('closestKey')
        let folder = action.get('folderDetails')

        if (folder == null) {
          break
        }

        if (Immutable.List.isList(folder)) {
          action.get('folderDetails', Immutable.List()).forEach((folder) => {
            state = bookmarkFoldersState.addFolder(state, folder, closestKey)
            state = syncUtil.updateObjectCache(state, folder, 'bookmarkFolders')
          })
        } else {
          state = bookmarkFoldersState.addFolder(state, folder, closestKey)
          state = syncUtil.updateObjectCache(state, folder, 'bookmarkFolders')
        }
        break
      }
    case appConstants.APP_EDIT_BOOKMARK_FOLDER:
      {
        let folder = action.get('folderDetails')

        if (folder == null) {
          break
        }

        state = bookmarkFoldersState.editFolder(state, folder, action.get('editKey'))
        state = syncUtil.updateObjectCache(state, folder, 'bookmarkFolders')

        break
      }
    case appConstants.APP_MOVE_BOOKMARK_FOLDER:
      {
        state = bookmarkFoldersState.moveFolder(
          state,
          action.get('folderKey'),
          action.get('destinationKey'),
          action.get('append'),
          action.get('moveIntoParent')
        )

        const destinationDetail = state.getIn(['bookmarkFolders', action.get('destinationKey')])
        state = syncUtil.updateObjectCache(state, destinationDetail, 'bookmarkFolders')
        break
      }
    case appConstants.APP_REMOVE_BOOKMARK_FOLDER:
      {
        const folder = state.getIn(['bookmarkFolders', action.get('folderKey')])
        state = bookmarkFoldersState.removeFolder(state, action.get('folderKey'))
        state = syncUtil.updateObjectCache(state, folder, 'bookmarkFolders')
        break
      }
  }

  return state
}

module.exports = bookmarkFoldersReducer
