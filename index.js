#!/usr/bin/env node

const path = require('path');
const fsExtra = require('fs-extra');
const fs = require('fs');
const events = require('events');
const inquirer = require('inquirer');
const { getRootDir,isEmpty } = require('./helpers/helpers');
class Events extends events {}
const e = new Events();

const { downloadVideos } = require('./src/download-video');


const resumeDownloads = async () => {
    try{
        await fsExtra.ensureDir(path.join(getRootDir(),'.youtube-downloader'));
        const downLoadFileExists = await fsExtra.pathExists(path.join(getRootDir(),'.youtube-downloader','downloads.json'));
        if(!downLoadFileExists)
            await fsExtra.writeJson(path.join(getRootDir(),'.youtube-downloader','downloads.json'),{});
        const downloadFileData = await fs.readJson(path.join(getRootDir(),'.youtube-downloader','downloads.json'));

        if(isEmpty(downloadFileData))
            console.log('You currently don\'t have any downloads' );

    }catch (e) {
        console.log(e);
    }
};


const downloadPlaylist = () => {
    console.log('download playlist')
};

const ytToAudio = () => {
    console.log('audio download');

};

e.on('resume downloads', resumeDownloads);
e.on('download video', downloadVideos);
e.on('download playlist', downloadPlaylist);
e.on('video to audio converter', ytToAudio);


const app = () => {
    console.log('Youtube for commandline written in js');
    inquirer.prompt([
        {
            type: 'list',
            name: 'url',
            choices: [
                'Resume downloads',
                'Download Video',
                'Download Playlist',
                'Video to audio converter'
            ],
        }
    ]).then(answer => {
        const response = typeof answer === 'object'? answer.url.toLowerCase(): false;
        if(response){
            e.emit(response);
        }
    })
};
app();
