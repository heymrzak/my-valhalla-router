const { exec, spawn } = require('child_process');
const fs = require('fs');

// 1. Force Valhalla to look at Railway's assigned dynamic port assignment
const port = process.env.PORT || "8002";
console.log(`Initializing system architecture on port: ${port}`);

// 2. Build a fresh, isolated config structure dynamically in memory on boot
const configSetup = `valhalla_build_config --config /tmp/valhalla.json --build-elevation=false --build-admins=false --build-time_zones=false`;

exec(configSetup, (error, stdout, stderr) => {
    if (error) {
        console.error(`Config generation failed: ${error.message}`);
        process.exit(1);
    }
    
    console.log("Configuration file dynamically compiled successfully.");

    // 3. Inject the network binding address directly so Railway's proxy can see it
    try {
        let rawConfig = fs.readFileSync('/tmp/valhalla.json', 'utf8');
        let jsonConfig = JSON.parse(rawConfig);
        
        // Force the HTTP service to bind cleanly to 0.0.0.0 instead of localhost
        if (jsonConfig.http_service) {
            jsonConfig.http_service.listen = `http://0.0.0:${port}`;
        }
        
        fs.writeFileSync('/tmp/valhalla.json', JSON.stringify(jsonConfig, null, 2));
        console.log("Network proxy configurations seamlessly mapped.");
    } catch (parseError) {
        console.error("Failed to patch JSON layout structure:", parseError);
        process.exit(1);
    }

    // 4. Launch the background daemon service cleanly
    console.log("Booting Valhalla core routing execution layer...");
    const valhallaProcess = spawn('valhalla_service', ['/tmp/valhalla.json']);

    valhallaProcess.stdout.on('data', (data) => console.log(`[Valhalla]: ${data}`));
    valhallaProcess.stderr.on('data', (data) => console.error(`[Valhalla Error]: ${data}`));

    valhallaProcess.on('close', (code) => {
        console.log(`Valhalla process exited with code ${code}`);
        process.exit(code);
    });
});

