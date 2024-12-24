> Jorge:
/**
 * Manejador principal del stream de video
 */
class StreamHandler {
    /**
     * @param {Object} config - Configuración inicial
     */
    constructor(config) {
        this.player = null;
        this.config = {
            containerId: 'player',
            errorContainer: 'error-message',
            theme: {
                colors: {
                    active: "#e50914",      // Color Netflix
                    inactive: "#ffffff",
                    background: "transparent"
                }
            },
            ...config
        };
    }

    /**
     * Construye la URL del proxy
     */
    buildProxyUrl(streamUrl) {
        return /?proxy=1&url=${encodeURIComponent(streamUrl)};
    }

    /**
     * Inicializa el stream
     */
    async initializeStream(playerData) {
        try {
            const { streamUrl, metadata } = playerData;
            if (!streamUrl) throw new Error('URL no proporcionada');

            const proxyUrl = this.buildProxyUrl(streamUrl);
            await this.setupPlayer(proxyUrl, metadata);
        } catch (error) {
            console.error('Error al inicializar stream:', error);
        }
    }

    /**
     * Configura el reproductor
     */
    async setupPlayer(proxyUrl, metadata = {}) {
        const playerInstance = jwplayer(this.config.containerId).setup({
            // Configuración básica
            width: "100%",
            height: "100%",
            aspectratio: "16:9",
            controls: true,
            sharing: true,
            displaytitle: true,
            displaydescription: true,
            abouttext: "WishDirect Player",
            aboutlink: "#",

            // Reproducción y volumen
            autostart: true,
            mute: false,
            volume: 100,
            startmuted: false,

            // Tema y apariencia
            skin: {
                name: "netflix"
            },
            ...this.config.theme,

            // Configuración técnica
            stretching: "uniform",
            primary: "html5",
            hlshtml: true,
            preload: "auto",
            file: proxyUrl,
            type: "hls",

            // Controles - Removemos explícitamente rewind
            controlbar: {
                elements: ['play', 'progress', 'duration', 'volume', 'fullscreen']
            },

            // Desactivar características por defecto
            features: {
                rewind: false,  // Desactivar botón de retroceso por defecto
                forward: false  // Desactivar botón de avance por defecto
            },

            // Agregar configuración del logo
            logo: {
                file: "/assets/images/logo.png",  // Ruta a tu logo
                position: "top-right",
                margin: "20",
                hide: false,
                link: "#",
                width: "150",   // ancho en píxeles
                height: "90"    // alto en píxeles
            },
        });

        // Forzar volumen después de la inicialización
        playerInstance.on('ready', function () {
            playerInstance.setMute(false);
            playerInstance.setVolume(100);
        });

        // Manejador de errores
        playerInstance.on('error', function (e) {
            console.error('Error del reproductor:', e);
        });

        // Configurar eventos cuando el player está listo
        playerInstance.on("ready", function () {
            const playerContainer = playerInstance.getContainer();
            const controlbar = playerContainer.querySelector(".jw-button-container");

            // Remover botones por defecto de forma más agresiva
            const defaultButtons = controlbar.querySelectorAll(".jw-icon-rewind, .jw-icon-forward");
            defaultButtons.forEach(button => button.remove());

> Jorge:
// Botón de retroceder personalizado
            const rewindButton = document.createElement("div");
            rewindButton.className = "jw-icon jw-icon-inline jw-button-color jw-reset custom-rewind-btn";
            rewindButton.innerHTML = "⏪10";
            rewindButton.onclick = () => playerInstance.seek(Math.max(0, playerInstance.getPosition() - 10));

            // Botón de adelantar personalizado
            const forwardButton = document.createElement("div");
            forwardButton.className = "jw-icon jw-icon-inline jw-button-color jw-reset custom-forward-btn";
            forwardButton.innerHTML = "10⏩";
            forwardButton.onclick = () => playerInstance.seek(playerInstance.getPosition() + 10);

            // Insertar botones después del botón de play
            const playButton = controlbar.querySelector(".jw-icon-playback");
            controlbar.insertBefore(rewindButton, playButton.nextSibling);
            controlbar.insertBefore(forwardButton, rewindButton.nextSibling);
        });

        this.player = playerInstance;
        return playerInstance;
    }
}
