const { dialog } = Myrequire('electron').remote
const {shell} = Myrequire('electron').remote;
const fs = Myrequire('fs');
var filePath = __dirname;
var list = new Array();
document.addEventListener('drop', function (e) { //拖拽事件
    e.preventDefault();
    e.stopPropagation();

    for (let f of e.dataTransfer.files) {
        list.push(f.path)
    }

    dialog.showOpenDialog({title:"选择保存路径",properties: ['openDirectory']},function(filePaths){
        filePath = filePaths[0];
        readFiles(list)
    })
    
    console.log(filePath,list)
    
});

document.addEventListener('dragover', function (e) {
    e.preventDefault();
    e.stopPropagation();
});

$(function ($) {
    $('#holder').click(function () {
        resolve(dialog.showOpenDialog({title:"选择资源", properties: ['openFile', 'openDirectory', 'multiSelections']}))
        dialog.showOpenDialog({title:"选择保存路径",properties: ['openDirectory']},function(filePaths){
            filePath = filePaths[0];
            readFiles(list)
        })
    })

    
})




async function readFiles (files) { //处理多个文件
    if (files == undefined || files == '') {
        return ''
    }
    
    for(var i = 0; i < files.length;i++){
        await new Promise((resovle,reject) => {
            resovle(isFiles(files[i]))
        }) 
    }

    return new Promise((resolve) => {
        resolve(openExt())
    })
}

openExt = () => {
    //全部执行完成之后
    dialog.showMessageBox({type:"info",title:"提醒",message:"文件写入成功"},function(){
        //打开目录
        shell.openExternal(filePath)
    })
}



isFiles = (file) => { //首次判断拖拽的文件是文件夹还是文件
    var stat = fs.statSync(file)
    if(stat.isDirectory()){
        readFold(file); //打开文件夹
    }

    if(stat.isFile()){
        if (isTxt(file)) {
            //当文件后缀为txt类型 则执行读取文件，并截取其中的文件
            core(file)
        }
    }
}


isTxt = (file) => { //判断文件后缀
    var index = file.lastIndexOf(".");
    var suffix = "";
    suffix = file.substring(index + 1, file.length);
    if (suffix === 'txt') {
        return true;
    }
    return false;
}

core = (file) => { //读取文件内容
    //使用异步读取文件
    fs.readFile(file, { encoding: 'utf8' }, function (err, datas) {
        var filename =""
        //获取文件名并返回新文件名
        newfileName = newFileName(file)
        var dataList = '';
        if (err) {
            dialog.showErrorBox("错误", "读取文件失败")
        }
        dataList = datas.split(/\s+/); //截取文件到数组中
        if (dataList == undefined || dataList == '') {
            return ""
        }
        for(var i = 0; i < dataList.length; i ++){
            dataList[i] = dataList[i].split("?")[1]
        }
        var i = 0;
        do {
            var start = i*200;
            var end = ((i+1)*200)-1;
            dataList.slice(start,end)
            filename = newfileName+"_"+i
            writeFiles(dataList.slice(start,end).join("\r\n"), filePath+"\\"+filename+".txt")
            i++;
        } while (i <= (parseInt(dataList.length / 200))); 
    })
}


writeFiles = (context,filename) => {  //写入文件
    if (context == undefined || context == "" || context == "undefined") {
        return ""
    }
    fs.writeFile(filename, context, { 'flag': 'a' }, function (err) {
        if (err) {
            console.log("采集错误")
            return false
        }
    })
}


readFold = (foldPath) => { //执行文件夹操作
    fs.readdir(foldPath, function (err, files) {
        if (err) {
            return false;
        }
        for(var i = 0; i < files.length;i++){
            (function(i){
                var director = foldPath + '\\' + files[i];
                fs.stat(director, function (err, stats) {
                    if (err) {
                        log(err);
                        return false;
                    }
                    if (stats.isDirectory()) {
                        readFold(director);
                    }
                    if (stats.isFile()) { //文件类型
                        if (isTxt(director)) {
                            //当文件后缀为txt类型 则执行读取文件，并截取其中的文件
                            console.log(director)
                            core(director)
                        }
                    }
                });
            })(i)
        }
    });
}

//截取文件名
newFileName = (file) => {
    return file.substring(file.lastIndexOf("\\")+1,file.lastIndexOf("."))
}