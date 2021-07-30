var Zip = require("adm-zip");

const fs = require("fs");
const uuid = require("uuid");
const dropboxV2Api = require("dropbox-v2-api");

const target_folder = "./target/";

fs.readdir(target_folder, "utf-8", (err, result) => {
    zipFolder(result)
})

const dropbox = dropboxV2Api.authenticate({
    token: ''
});

function uloadAtEnd(zipName){
    dropbox({
        resource: 'files/upload',
        parameters: {
            path: '/backupfolder/' + zipName + ".zip", 
        },
        readStream: fs.createReadStream(zipName + ".zip")
    }, (err, result, response) => {
        //upload completed
        console.log(err, result, response);
    });
}


function zipFolder(result){
    var zip = new Zip();

    const _uuid = uuid.v4();

    result.forEach(t => {
        console.log(t);
        if(fs.lstatSync(target_folder + t).isDirectory()){
            zip.addLocalFolder(target_folder + t, t + "/")
        } else {
            zip.addLocalFile(target_folder + t);
        }
    })
    // add file directly
    // get everything as a buffer
    var willSendthis = zip.toBuffer();
    // or write everything to disk
    d = new Date()
    zip.writeZip("./"+_uuid+".zip");

    uloadAtEnd(_uuid)
}
