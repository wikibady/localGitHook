require('colors');

const LOGO = '[git-hook]'


module.exports = {
    log: function (string, options) {
        if (typeof (string) == 'string') {
            var showLog = doOptionsSet(LOGO + ' ' + '[LOG]' + ' ' + string, options)
            console.log(showLog.cyan)
        } else {
            console.log(string)
        }
    },
    success: function (string, options) {
        if (typeof (string) == 'string') {
            var showLog = doOptionsSet(LOGO + ' ' + '[SUCCESS]' + ' ' + string, options)
            console.log(showLog.green)
        } else {
            console.log(string)
        }
    },
    error: function (string, options) {
        if (typeof (string) == 'string') {
            var showLog = doOptionsSet(LOGO + ' ' + '[ERROR]' + ' ' + string, options)
            console.log(showLog.red)
        } else {
            console.log(string)
        }
    },
    text: function (string, type) {
        return LOGO + ' ' + '[' + type + ']' + ' ' + string
    }
}

function doOptionsSet(string, options) {
    if (options && options.wrap) {
        string = '\n' + string
    }
    return string
}