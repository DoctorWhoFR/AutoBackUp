var Zip = require("adm-zip");
const webhook = require("webhook-discord")

const fs = require("fs");
const uuid = require("uuid");
const dropboxV2Api = require("dropbox-v2-api");

var term = require( 'terminal-kit' ).terminal ;


let Client = require('ssh2-sftp-client');

const backup_mod = "sftp"; // sftp = for sftp upload / dropbox = for dropbox upload (need token)

const _webhook = "https://discord.com/api/webhooks/871686819803172865/PgoD8kkBgZTqT_HTVarxW8V5b-SMXVKBAiHvYFK-u72rD-wUtXTOY3O9UYuWdUdTyo3C";
const Hook = new webhook.Webhook(_webhook)

const _token = "";

let sftp = new Client();


const to_zip = ['plugins', 'world']
const target_folder = "E:/mc_server/";


fs.readdir(target_folder, "utf-8", (err, result) => {
    zipFolder(result)
})

const dropbox = dropboxV2Api.authenticate({
    token: _token
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
	
		if(!err){
			Hook.info("BACKBOT", "new backup:\n" + zipName)
		}
        console.log(err, result, response);
    });
}


function uploadAtEndSftp(zipName){
	var _local = "./" + zipName + ".zip"
	var _target = "./backup/" + zipName + ".zip"
	term.blue("starting sftp upload \n\n")

	sftp.connect({
	  host: '51.158.154.12',
	  username: 'azgin',
	  password: 'Emf12345!'
	}).then(() => {
		
		
	  return sftp.fastPut(_local, _target);

	}).then(data => {
		
	  Hook.info("BACKBOT", "new backup:\n" + zipName)
	  term.green('file succesful uploaded \n\n');
	  sftp.end();
	  
	  try {
		  fs.unlinkSync(_local)
		  term.green("- successful removed " + _local)
		  //file removed
		} catch(err) {
		  console.error(err)
		}
	  
	}).catch(err => {
	  console.log(err, 'catch error');
	});

}


function zipFolder(result){
	
	term.clear()
	
	term.blue("AutoBackup server by DrAzgin for Mine&Slash \n\n")
	
    var zip = new Zip();

    const _uuid = uuid.v4();

    result.forEach(t => {
        try{
			
			
			if(to_zip.includes(t)){
				if(fs.lstatSync(target_folder + t).isDirectory()){
					zip.addLocalFolder(target_folder + t, t + "/")
				} else {
					zip.addLocalFile(target_folder + t);
				}
				
				term.green("+ " + t + "\n\n")
			}
			

		} catch {
		}
    })
	
    d = new Date()
    zip.writeZip("./"+_uuid+".zip");

	if(backup_mod == "sftp"){
		uploadAtEndSftp(_uuid)
		term.yellow("upload into sftp \n\n")
	} else if(backup_mod == "dropbox"){
		
		term.yellow("upload into dropbox \n\n")
		uloadAtEnd(_uuid)
	}
}
