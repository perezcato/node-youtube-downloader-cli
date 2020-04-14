#!/usr/bin/env node


const youtube = require('youtube-dl');
const ora  = require('ora');
const path = require('path');
const fs = require('fs-extra');
const events = require('events');
const inquirer = require('inquirer');
const {} = require('./helpers');
class Events extends events {}
const e = new Events();


const resumeDownloads = async () => {
    try{
        await fs.ensureDir('cl/.youtube-downloader');
        console.log('folder ensured');
    }catch (e) {
        console.log(e);
    }
};

const downloadVideos = () => {
    console.log('download video');

};

const downloadPlaylist = () => {
    console.log('download playlist')
};

const ytToAudio = () => {
    console.log('audio download');

};

e.on('resume all downloads', resumeDownloads);
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
                'Resume all downloads',
                'Download Video',
                'Download Playlist',
                'Video to audio converter'
            ],
        }
    ]).then(answer => {
        const response = typeof answer === 'object'? answer.url.toLowerCase(): false;
        if(response){
            e.emit(response);
            //console.log(path.join(__dirname,'/dirname'));
        }
    })
};

app();


// const videoUrl = 'https://www.youtube.com/watch?v=j5-yKhDd64s';
// const playlistUrl = `https://www.youtube.com/playlist?list=PLgJIx0-UaB9QYjno8U4Sw_u_NrSCanQYB`;
// let details = false;
// const spinner = ora('Getting Video info');
//
// const yt = youtube.exec(playlistUrl,['--dump-single-json'],{},(err, output) => {
//     let details = true;
//     if(details)
//         spinner.stop();
//     if(err) console.log(err);
//     else
//         console.log(JSON.parse(output));
// });
//
// if(!details) spinner.start();
