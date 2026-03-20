import React from 'react';

interface FluidVideoContainerProps {
  /**
   * La URL del video (puede ser un enlace de YouTube/embed o un archivo de video directo).
   */
  src: string;
  /**
   * Un flag para determinar si renderizamos una etiqueta <iframe /> (para YouTube/Vimeo)
   * o una etiqueta <video /> nativa de HTML5 con la propiedad controls.
   * @default true
   */
  isIframe?: boolean;
  /**
   * Para el atributo title del iframe, garantizando buenas prácticas de accesibilidad y SEO.
   */
  title: string;
}

/**
 * FluidVideoContainer
 * 
 * Un componente reutilizable que mantiene una proporción de aspecto de 16:9 (aspect-video)
 * y es totalmente responsivo. Resuelve problemas de layout al escalar videos en diferentes dispositivos.
 * 
 * @param props FluidVideoContainerProps
 */
const FluidVideoContainer: React.FC<FluidVideoContainerProps> = ({
  src,
  isIframe = true,
  title,
}) => {
  return (
    <div className="relative w-full aspect-video rounded-xl md:rounded-2xl overflow-hidden shadow-lg md:shadow-xl bg-gray-900">
      {isIframe ? (
        <iframe
          src={src}
          title={title}
          className="w-full h-full object-cover border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <video
          src={src}
          title={title}
          controls
          className="w-full h-full object-cover"
        >
          Tu navegador no soporta el elemento de video.
        </video>
      )}
    </div>
  );
};

export default FluidVideoContainer;
