function ImageWithFallback({ src, fallback, alt = '', ...props }) {
  return (
    <img
      src={src}
      alt={alt}
      {...props}
      onError={(e) => {
        e.currentTarget.onerror = null
        e.currentTarget.src = fallback
      }}
    />
  )
}

export default ImageWithFallback
