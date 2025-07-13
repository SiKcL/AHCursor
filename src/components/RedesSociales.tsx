'use client'

import { useEffect, useState, useRef } from 'react';

// Declarar window.FB para TypeScript
declare global {
    interface Window {
        FB: any;
    }
}

export default function SocialReels() {
    const [enlaces, setEnlaces] = useState<any[]>([]);
    const [facebookLoaded, setFacebookLoaded] = useState(false);
    const fbContainerRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        fetch('/api/redes')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setEnlaces(data);
                    // Verificar si hay embeds de Facebook para cargar el script
                    const hasFacebookEmbeds = data.some((enlace: any) => 
                        enlace.url.includes('class="fb-post"') || enlace.url.includes('facebook.com')
                    );
                    if (hasFacebookEmbeds && !facebookLoaded) {
                        loadFacebookSDK();
                    }
                }
            });
    }, [facebookLoaded]);

    // Llama a FB.XFBML.parse() después de renderizar los embeds de Facebook
    useEffect(() => {
        if (facebookLoaded && typeof window !== 'undefined' && window.FB) {
            window.FB.XFBML.parse();
        }
    }, [enlaces, facebookLoaded]);

    const loadFacebookSDK = () => {
        if (document.getElementById('facebook-jssdk')) {
            setFacebookLoaded(true);
            return;
        }
        const script = document.createElement('script');
        script.id = 'facebook-jssdk';
        script.async = true;
        script.defer = true;
        script.crossOrigin = 'anonymous';
        script.src = 'https://connect.facebook.net/es_LA/sdk.js#xfbml=1&version=v19.0';
        script.onload = () => setFacebookLoaded(true);
        document.head.appendChild(script);
        if (!document.getElementById('fb-root')) {
            const fbRoot = document.createElement('div');
            fbRoot.id = 'fb-root';
            document.body.appendChild(fbRoot);
        }
    };

    const renderEmbed = (enlace: any, index: number) => {
        const { url, titulo } = enlace;
        const title = titulo || `Red social ${index + 1}`;

        // Si es un código embed completo (contiene HTML)
        if (url.includes('<') && url.includes('>')) {
            // Para Facebook embeds
            if (url.includes('class="fb-post"')) {
    return (
                    <div
                        key={enlace.id || index}
                        ref={el => { fbContainerRefs.current[index] = el; }}
                        className="w-full rounded-lg shadow-md bg-white p-0 mb-2"
                        style={{ minHeight: 200 }}
                    >
                        <div dangerouslySetInnerHTML={{ __html: url }} />
                </div>
                );
            }
            // Para Instagram embeds
            if (url.includes('class="instagram-media"')) {
                return (
                    <div key={enlace.id || index} className="relative w-full overflow-hidden rounded-lg shadow-md" style={{ paddingTop: '177.77%' }}>
                        <div 
                            dangerouslySetInnerHTML={{ __html: url }}
                            className="absolute top-0 left-0 w-full h-full"
                        />
                </div>
                );
            }
            // Para otros embeds (YouTube, etc.)
            return (
                <div key={enlace.id || index} className="relative w-full overflow-hidden rounded-lg shadow-md" style={{ paddingTop: '177.77%' }}>
                    <div 
                        dangerouslySetInnerHTML={{ __html: url }}
                            className="absolute top-0 left-0 w-full h-full"
                        />
                </div>
            );
        }
        // Si es una URL de iframe (formato anterior)
        return (
            <div key={enlace.id || index} className="relative w-full overflow-hidden rounded-lg shadow-md" style={{ paddingTop: '177.77%' }}>
                        <iframe
                    src={url}
                    title={title}
                            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                            allowFullScreen
                            className="absolute top-0 left-0 w-full h-full"
                        />
                </div>
        );
    };

    return (
        <section className="w-full px-4 sm:px-6 lg:px-8 py-0">
            <h2 className="text-2xl font-bold text-center mb-6">Síguenos en nuestras redes sociales</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 max-w-3xl mx-auto">
                {enlaces.length === 0 && (
                    <div className="col-span-2 text-center text-gray-500">No hay enlaces de redes sociales.</div>
                )}
                {enlaces.map((enlace, idx) => renderEmbed(enlace, idx))}
            </div>
        </section>
    );
  }
  
  