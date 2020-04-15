#!/usr/bin/env node


const youtube = require('youtube-dl');
const ora  = require('ora');
const path = require('path');
const fsExtra = require('fs-extra');
const fs = require('fs');
const { StringDecoder } = require('string_decoder');
const events = require('events');
const inquirer = require('inquirer');
const { spawn } = require('child_process');
const { getRootDir,isEmpty,convertSize } = require('./helpers/helpers');
class Events extends events {}
const e = new Events();


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

const downloadVideos = async () => {
    try{
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
        const { url } = await inquirer.prompt({
            type: 'input', name: 'url', message: 'Enter video url',
            validate: (value) => value.match(regExp) ? true :'Enter a valid url'
        });
        const spinner = ora('getting video info');
        youtube.exec(url,['--dump-single-json'], {},  async(err,output) => {
            spinner.stop();
            if(err) throw err;
            const video = JSON.parse(output);
            const availableFormats = [];
            for(let i = 0; i < video.formats.filter(format => format.ext === 'mp4').length; i++){
                availableFormats.push({
                    'format': video.formats.filter(format => format.ext === 'mp4')[i].format,
                    'format_id': video.formats.filter(format => format.ext === 'mp4')[i].format_id,
                    'format_size': `${convertSize(video.formats.filter(format => format.ext === 'mp4')[i].filesize)}`,
                    'format_note': video.formats.filter(format => format.ext === 'mp4')[i].format_note,
                    'sort': video.formats.filter(format => format.ext === 'mp4')[i].filesize,
                    name: `${video.formats.filter(format => format.ext === 'mp4')[i].format} -:${convertSize(video.formats.filter(format => format.ext === 'mp4')[i].filesize)}`
                });
            }
            availableFormats.sort((a,b) => a.sort-b.sort);
            console.log('File Name:', video.title);
            const { format } = await inquirer.prompt({
                type: 'checkbox',
                name: 'format',
                choices: availableFormats,
                validate: (answer) => {
                    if(answer.length !== 1)
                        return 'You must choose a format';
                    return true;
                }
            });
            const selectedFormat = availableFormats.find(vidFormat => vidFormat.format === format[0].split('-:')[0].trim());
            console.log(selectedFormat.format_id);

            const videoDownloading  = spawn('youtube-dl',
                [`-f ${selectedFormat.format_id}+worstaudio[ext=m4a]`, url],
                {cwd: `${getRootDir()}/Downloads/`});

            videoDownloading.stdout.on('data', data => {
                spinner.start('Downloading ........');
                console.log((new StringDecoder()).write(data));
            });
            videoDownloading.stderr.on('data' , data => {
                console.log((new StringDecoder()).write(data));
            });

            videoDownloading.on('close', code => {
                spinner.stop();
                console.log('download Complete....................');
            });
        });
        spinner.start();
    }catch (e) {
        console.log(e)
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
