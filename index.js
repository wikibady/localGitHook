const util = require('./utils/util')
const logger = util.logger


logger.log('初始化开始')

util.doShell('cat package.json | grep -E "*: *"', {
    loading: true,
    log: '正在检查依赖'
}, async function (err, stdout, stderr) {
    if (err) {
        if(stderr.indexOf('ajv@^6.0.0')>-1){
            ; // pass
        }else{
            logger.error('缺少依赖，请检查')
        }
    }
    //"eslint": "^5.1.0",
    //"babel-eslint": "^8.2.6"
    var modulesList = []
    if (stdout.indexOf('babel-eslint') < 0) {
        modulesList.push('babel-eslint')
    }
    if (stdout.indexOf('eslint') < 0) {
        modulesList.push('eslint@4.5.0')
    }
    if (stdout.indexOf('eslint-plugin-vue') < 0) {
        modulesList.push('eslint-plugin-vue')
    }
    if (modulesList.length == 0) {
        init()
    } else {
        logger.log('缺少依赖,将为您自动安装', {
            wrap: true
        })
        var shell = 'tnpm install ' + modulesList.join(' ') + ' --save-dev'
        util.doShell(shell, {
            loading: true,
            log: '正在安装依赖：' + modulesList.join(' ')
        }, function (err, stdout, stderr) {
            if (err) {
                logger.error('tnpm依赖安装失败')
                if(stderr.indexOf('tnpm')>-1){
                    shell = 'npm install ' + modulesList.join(' ') + ' --save-dev'
                    util.doShell(shell, {
                        loading: true,
                        log: '尝试使用npm安装依赖：' + modulesList.join(' ')
                    }, function (err, stdout, stderr) {
                        if (err) {
                            logger.error('npm依赖安装失败')
                            logger.error(err)
                        }else{
                            init()
                        }
                    })
                }
            } else {
                init()
            }
        })
        //logger.error(stderr)
    }
})

async function init() {
    var commit_path = process.platform === 'win32'?'/node_modules/local-git-hook/pre-commit-win':'/node_modules/local-git-hook/pre-commit-os'
    var commitResult = await util.setFile({
        aimFileNmae: 'pre-commit',
        aimFilePath: '/.git/hooks/pre-commit',
        noAimFilePathError: '没有找到.git/hooks 路径，请确认是否执行过git init',
        formFilePath: commit_path
    })
    if (commitResult.code == 0) {
        logger.success('pre-commit 初始化完成！')
        logger.log('eslintrc 初始化')
        var eslintrcResult = await util.setFile({
            aimFileNmae: 'eslintrc',
            aimFilePath: '/.eslintrc.js',
            noAimFilePathError: '没有找到.eslintrc.js 路径',
            formFilePath: '/node_modules/local-git-hook/.eslintrc.js'
        })
        if (eslintrcResult.code == 0) {
            logger.success('eslintrc 初始化完成！')
            util.doShell('chmod +x .git/hooks/pre-commit', {},function(err,stdout,stderr){
            })
            //.gitignore
            logger.log('gitignore 初始化')
            var gitignoreResult = await util.setFile({
                aimFileNmae: 'gitignore',
                aimFilePath: '/.gitignore',
                noAimFilePathError: '没有找到.gitignore 路径',
                formFilePath: '/node_modules/local-git-hook/.ignore'
            })
            if (gitignoreResult.code == 0) {
                logger.success('gitignore 初始化完成！')
                logger.success('git-hook 初始化完成！可以体验啦')
            }
        }
    } else {
        logger.error('pre-commit 设置失败：')
        logger.log(commitResult)
    }
} 