var _ = require('lodash');
var chalk = require('chalk');

(function () {
  'use strict'

  // var PLUGIN_ID = require('./package.json').name
  var MENU_ID = 'habanero'
  var MENU_LABEL = '$$$/JavaScripts/Generator/Habanero/Menu=Habanero'

  var _generator = null
  // var _currentDocumentId = null
  var _config = null

/* ********** INIT ********** */

  function init (generator, config) {
    _generator = generator
    _config = config

    console.log('Initializing generator habanero with config %j', _config)

    _generator.addMenuItem(MENU_ID, MENU_LABEL, true, false).then(
      function () {
        console.log('Menu created', MENU_ID)
      },
      function () {
        console.error('Menu creation failed', MENU_ID)
      }
    )

    _generator.onPhotoshopEvent('generatorMenuChanged', handleGeneratorMenuClicked)

    function initLater () {
      // Flip foreground color
      var flipColorsExtendScript = 'var color = app.foregroundColor; color.rgb.red = 255 - color.rgb.red; color.rgb.green = 255 - color.rgb.green; color.rgb.blue = 255 - color.rgb.blue; app.foregroundColor = color;'
      sendJavascript(flipColorsExtendScript)
      requestEntireDocument()
    }

    process.nextTick(initLater)
  }

  /* ********** EVENTS ********** */

  /* function handleCurrentDocumentChanged (id) {
    console.log('handleCurrentDocumentChanged: ' + id)
    setCurrentDocumentId(id)
  } */

  function handleGeneratorMenuClicked (event) {
    // Ignore changes to other menus
    var menu = event.generatorMenuChanged
    if (!menu || menu.name !== MENU_ID) {
      return
    }
    var startingMenuState = _generator.getMenuState(menu.name)
    console.log('Menu event %s, starting state %s', stringify(event), stringify(startingMenuState))
  }

  /* ********** CALLS ********** */

  function requestEntireDocument (documentId) {
    if (!documentId) {
      console.log('Determining the current document ID')
    }
    _generator.getDocumentInfo(documentId).then(
      function (document) {
        // console.log('Received complete document:', stringify(document))
        _.forEach(document.layers, function (layer) {
          if (layer.type === 'layerSection') {
            console.log(chalk.magenta('Group layer: '), layer.name)
          }
        })
      },
      function (err) {
        console.error('Error in getDocumentInfo:', err)
      }
    ).done()
  }

  /* function updateMenuState (enabled) {
    console.log('Setting menu state to', enabled)
    _generator.toggleMenu(MENU_ID, true, enabled)
  } */

  /* ********** HELPERS ********** */

  function sendJavascript (str) {
    _generator.evaluateJSXString(str).then(
      function (result) {
        console.log(result)
      },
      function (err) {
        console.log(err)
      }
    )
  }

  /* function setCurrentDocumentId (id) {
    if (_currentDocumentId === id) {
      return
    }
    console.log('Current document ID:', id)
    _currentDocumentId = id
  } */

  function stringify (object) {
    try {
      return JSON.stringify(object, null, '    ')
    } catch (e) {
      console.error(e)
    }
    return String(object)
  }

  exports.init = init

  // Unit test function exports
  exports._setConfig = function (config) {
    _config = config
  }
}())
