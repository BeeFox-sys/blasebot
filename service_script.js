var Service = require('node-windows').Service;
     // Create a new service object
     var svc = new Service({
          name:'CodeBlaseMkII',
          description: 'Blaseball Stream for Discord',
          script: 'C:\\Users\\willo\\Desktop\\blasebot\\bot\\main.js'
     });

     // Listen for the "install" event, which indicates the
     // process is available as a service.

     svc.on('install',function(){
                svc.start();
     });

     svc.install(); 