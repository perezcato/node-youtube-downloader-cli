
const youtube = require('youtube-dl');
const ora  = require('ora');
const { StringDecoder } = require('string_decoder');
const inquirer = require('inquirer');
const { spawn } = require('child_process');
const { getRootDir,convertSize } = require('../helpers/helpers');


exports.downloadVideos = async () => {
    try{
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
        const { url } = await inquirer.prompt({
            type: 'input', name: 'url', message: 'Enter video url',
            validate: (value) => value.match(regExp) ? true :'Enter a valid url'
        });
        const spinner = ora('getting video info');
        youtube.exec(url,['--dump-single-json'], {},  async(err,output) => {
            spinner.stop();
            if(err) console.log('something went wrong');
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
                [`-o %(title)s.%(ext)s -f ${selectedFormat.format_id}+worstaudio[ext=m4a]`, url],
                {cwd: `${getRootDir()}/Downloads/`});

            videoDownloading.stdout.on('data', data => {
                spinner.start('Downloading ........');
                console.log((new StringDecoder()).write(data));
            });

            videoDownloading.stderr.on('data' , data => {
                console.log((new StringDecoder()).write(data));
            });

            videoDownloading.on('close', async (code) => {
                spinner.stop();
                console.log('download Complete....................');
                const continueDownload = await inquirer.prompt({
                    type: 'checkbox',
                    message: 'Do you wish to download a different video?',
                    name: 'continue',
                    choices: [
                        {
                            name: 'Yes'
                        },
                        {
                            name: 'No'
                        }
                    ]
                });
                if(continueDownload.continue.toLowerCase() === 'yes') this.downloadVideos();
            });
        });
        spinner.start();
    }catch (e) {
        console.log(e)
    }

};
