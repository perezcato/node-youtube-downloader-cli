const { exec,spawn } = require('child_process');
const StringDecoder = require('string_decoder');

//const vidDownload = spawn('ls', ['~/Downloads']);
const listDownload = spawn('ls', ['-a','~/projects']);

listDownload.stdout.on('data',data => {
   // listDownload.stdout.on('on',data => {
   //     console.log(data)
   // })
   //  listDownload.stderr.on('on',data => {
   //      console.log(data)
   //  })
    console.log((new StringDecoder()).write(data));
});

listDownload.stderr.on('data',data => {
    console.log(data);
    console.log((new StringDecoder()).write(data));
});
