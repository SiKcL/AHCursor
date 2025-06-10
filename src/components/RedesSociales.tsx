export default function SocialReels() {
    return (
        <section className="w-full px-4 sm:px-6 lg:px-8 py-0">
            <h2 className="text-2xl font-bold text-center mb-6">Síguenos en nuestras redes sociales</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 max-w-3xl mx-auto">
                {/* Reel Facebook */}
                <div className="relative w-full overflow-hidden rounded-lg shadow-md" style={{ paddingTop: '177.77%' }}>
                        <iframe
                            src="https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1318135712799220%2F&width=500&show_text=false&height=889&appId"
                            // Recuerda lo de la URL de Facebook
                            title="Reel Facebook"
                            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                            allowFullScreen
                            className="absolute top-0 left-0 w-full h-full"
                        />
                </div>
                <div className="relative w-full overflow-hidden rounded-lg shadow-md" style={{ paddingTop: '177.77%' }}>
                        <iframe
                           src="https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F3735171506762904%2F&show_text=false&width=267&t=0"
                            title="Reel Facebook"
                            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                            allowFullScreen
                            className="absolute top-0 left-0 w-full h-full"
                        />
                </div>

                {/* Reel Instagram */}
                <div className="relative w-full overflow-hidden rounded-lg shadow-md" style={{ paddingTop: '177.77%' }}>
                        <iframe
                            src="https://www.instagram.com/reel/DKN8BY-MgVU/embed"
                            title="Reel Instagram"
                            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                            allowFullScreen
                            className="absolute top-0 left-0 w-full h-full"
                        />
                </div>
                <div className="relative w-full overflow-hidden rounded-lg shadow-md" style={{ paddingTop: '177.77%' }}>
                        <iframe
                            src="https://www.instagram.com/reel/DGv2RWfpYs3/embed"
                            title="Reel Instagram"
                            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                            allowFullScreen
                            className="absolute top-0 left-0 w-full h-full"
                        />
                </div>
            </div>
        </section>
    );
  }
  
  