var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');



var logger = require('./logger.js')
//if (!err && stderr.indexOf('ERR') < 0) {
function doShell(shell, options, callback) {
    if (options && options.loading) {
        loadingTimer = (function () {
            var P = ["", ".", "..", "..."];
            var x = 0;
            return setInterval(function () {
                process.stdout.write('\x1b[36m' + '\r' + logger.text(options.log, 'shell') + P[x++]);
                x &= 3;
            }, 150);
        })();
    }


    exec(shell, function (err, stdout, stderr) {
        clearInterval(loadingTimer)
        callback(err, stdout, stderr)
    })
}

function setFile(options) {
    var aimFileNmae = options.aimFileNmae // pre-commit
    var aimFilePath = options.aimFilePath // '/.git/hooks/pre-commit'
    var noAimFilePathError = options.noAimFilePathError//'没有找到.git/hooks 路径，请确认是否执行过git init'

    var formFilePath = options.formFilePath //'/pre-commit'


    return new Promise(function (resolve, reject) {
        logger.log('start write '+aimFileNmae, {
            wrap: true
        })
        var __dirRoot = process.cwd()
        fs.open(__dirRoot + aimFilePath, 'w+', (err, fd) => {
            // pre-commit
            if (err) {
                if (err.errno == -4058) {
                    logger.error(noAimFilePathError)
                }
                resolve({
                    code: -1,
                    msg: 'no '+aimFilePath+' in this path',
                    data: err
                })
                return
            };
            if (fd) {
                fs.readFile(__dirRoot + formFilePath, 'utf8', (err, data) => {
                    if (err) {
                        logger.error('配置读取失败，请检查包完整性')
                        resolve({
                            code: -2,
                            msg: 'no '+formFilePath+' in this path',
                            data: err
                        })
                        return
                    } else {
                        fs.write(fd, data, 0, (err, written, string) => {
                            if (err) {
                                logger.error('写配置失败')
                                resolve({
                                    code: -3,
                                    msg: 'set '+aimFileNmae+' err',
                                    data: err
                                })
                                return
                            } else {

                                fs.close(fd, (err) => {
                                    if (err) {
                                        resolve({
                                            code: -4,
                                            msg: 'fs close err',
                                            data: err
                                        })
                                        return
                                    };
                                    logger.success(aimFileNmae+'写配置完成')
                                    resolve({
                                        code:0
                                    })
                                });
                            }

                        })
                    }


                })


            }

        })
    })

}


module.exports = {
    doShell: doShell,
    logger: logger,
    setFile: setFile
}