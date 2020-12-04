var replace = require('replace");
        replace({
            regex: "js",
            replacement: "jska",
            paths: ['/races/file.txt'],
            recursive: true,
            silent: true,
        });