import Image from "next/image";

export default function Footer() {
  return (
    <footer
      className="w-full text-white py-8 mt-10"
      style={{ backgroundColor: "#070e5c" }}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 flex justify-between items-center flex-wrap gap-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png" 
            alt="Agrícola Horizonte Logo"
            width={100}
            height={1}
            className="rounded-full"
          />
          <span className="font-bold text-lg">Agricultores Tradicionales e Hidroponicos.🌱💧</span>
        </div>

        {/* Redes Sociales */}
        <div className="text-center sm:text-left">
          <h3 className="font-semibold mb-2">Redes Sociales</h3>
          <ul className="flex flex-col gap-3 justify-center sm:justify-start">
            <li>
              <a
                href="https://www.facebook.com/AgricolaHorizonte.m/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="hover:text-[color:var(--highlight)] transition-colors flex items-center gap-2"
              >
                Facebook
                <Image
                  src="/facebook.png"
                  alt="Facebook icono"
                  width={20}
                  height={20}
                  />
              </a>
            </li>
            <li>
              <a
                href="hhttps://www.instagram.com/agricolahorizonte.m/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="hover:text-[color:var(--highlight)] transition-colors flex items-center gap-2"
              >
                Instagram
                <Image
                  src="/insta.png"
                  alt="Instagram icono"
                  width={20}
                  height={20}
                />
              </a>
            </li>
          </ul>
        </div>

        {/* Dirección */}
        <div className="text-center sm:text-left">
          <h3 className="font-semibold mb-2">Dirección</h3>
          <address className="not-italic">
            Melipilla, Santiago<br />
            Chile
          </address>
        </div>

        {/* Contacto */}
        <div className="text-center sm:text-left">
          <h3 className="font-semibold mb-2">Contacto</h3>
          <p>Email: agricolahorizonte.m@gmail.com</p>
          <p>Tel: +56 9 7382 1569</p>
        </div>
      </div>

      <p className="mt-8 text-center text-sm opacity-75 px-6">
        &copy; {new Date().getFullYear()} Agrícola Horizonte. Todos los derechos reservados.
      </p>
    </footer>
  );
}

