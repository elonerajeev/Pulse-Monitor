const Customers = () => {

  const customerLogos = [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
      alt: "Google"
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/5/51/Meta_Platforms_2021_logo.svg",
      alt: "Meta"
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
      alt: "Microsoft"
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
      alt: "Amazon"
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
      alt: "Netflix"
    },
    {
      src: "https://zintellix.com/wp-content/uploads/2024/02/Zintellix-logo-white-1.png",
      alt: "Zintellix"
    }
  ];

  // ✅ fallback if image fails
  const handleImageError = (e: any) => {
    e.target.src = "https://dummyimage.com/160x50/1f2937/ffffff&text=Logo";
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 text-center">

        <h3 className="text-lg text-muted-foreground mb-10">
          Trusted and sponsored by{" "}
          <a
            href="https://zintellix.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline font-semibold"
          >
            @Zintellix.com
          </a>
        </h3>

        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8">

          {customerLogos.map((logo) =>
            logo.alt === "Zintellix" ? (

              <a
                key={logo.alt}
                href="https://zintellix.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition transform hover:scale-105 hover:opacity-90"
              >
                <img
                  src={logo.src}
                  alt={logo.alt}
                  onError={handleImageError}
                  className="h-10 object-contain"
                />
              </a>

            ) : (

              <img
                key={logo.alt}
                src={logo.src}
                alt={logo.alt}
                onError={handleImageError}
                className="h-10 object-contain opacity-80 hover:opacity-100 transition"
              />

            )
          )}

        </div>

      </div>
    </section>
  );
};

export default Customers;
