import * as React from "react";

export default function MyComponent() {
  return (
    <>
      <div className="div">
        <div className="div-2">
          <div className="div-3">
            <div className="div-4">
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/82928fb2c003dfd0a27d6e1b1f9c5358012f85f6f524621343b88a7a28d491c5?apiKey=346b924dbccd4280acc07bd2ffd516fd&"
                className="img"
              />
              <div className="div-5">Meet the Team</div>
            </div>
            <div className="div-6">The Team carrying the legacy ahead!</div>
            <img
              loading="lazy"
              srcSet="https://cdn.builder.io/api/v1/image/assets/TEMP/c6bf2be05206837a908a446cb1933cf708a405713475049738596c554315c8b1?apiKey=346b924dbccd4280acc07bd2ffd516fd&width=100 100w, https://cdn.builder.io/api/v1/image/assets/TEMP/c6bf2be05206837a908a446cb1933cf708a405713475049738596c554315c8b1?apiKey=346b924dbccd4280acc07bd2ffd516fd&width=200 200w, https://cdn.builder.io/api/v1/image/assets/TEMP/c6bf2be05206837a908a446cb1933cf708a405713475049738596c554315c8b1?apiKey=346b924dbccd4280acc07bd2ffd516fd&width=400 400w, https://cdn.builder.io/api/v1/image/assets/TEMP/c6bf2be05206837a908a446cb1933cf708a405713475049738596c554315c8b1?apiKey=346b924dbccd4280acc07bd2ffd516fd&width=800 800w, https://cdn.builder.io/api/v1/image/assets/TEMP/c6bf2be05206837a908a446cb1933cf708a405713475049738596c554315c8b1?apiKey=346b924dbccd4280acc07bd2ffd516fd&width=1200 1200w, https://cdn.builder.io/api/v1/image/assets/TEMP/c6bf2be05206837a908a446cb1933cf708a405713475049738596c554315c8b1?apiKey=346b924dbccd4280acc07bd2ffd516fd&width=1600 1600w, https://cdn.builder.io/api/v1/image/assets/TEMP/c6bf2be05206837a908a446cb1933cf708a405713475049738596c554315c8b1?apiKey=346b924dbccd4280acc07bd2ffd516fd&width=2000 2000w, https://cdn.builder.io/api/v1/image/assets/TEMP/c6bf2be05206837a908a446cb1933cf708a405713475049738596c554315c8b1?apiKey=346b924dbccd4280acc07bd2ffd516fd&"
              className="img-2"
            />
            <div className="div-7">NAME</div>
            <div className="div-8">Designation</div>
          </div>
          <img
            loading="lazy"
            srcSet="https://cdn.builder.io/api/v1/image/assets/TEMP/43ce6330dd48a959b7a514d4e55e664fec7b69c7a7444e6a379f70a0f5eb768d?apiKey=346b924dbccd4280acc07bd2ffd516fd&width=100 100w, https://cdn.builder.io/api/v1/image/assets/TEMP/43ce6330dd48a959b7a514d4e55e664fec7b69c7a7444e6a379f70a0f5eb768d?apiKey=346b924dbccd4280acc07bd2ffd516fd&width=200 200w, https://cdn.builder.io/api/v1/image/assets/TEMP/43ce6330dd48a959b7a514d4e55e664fec7b69c7a7444e6a379f70a0f5eb768d?apiKey=346b924dbccd4280acc07bd2ffd516fd&width=400 400w, https://cdn.builder.io/api/v1/image/assets/TEMP/43ce6330dd48a959b7a514d4e55e664fec7b69c7a7444e6a379f70a0f5eb768d?apiKey=346b924dbccd4280acc07bd2ffd516fd&width=800 800w, https://cdn.builder.io/api/v1/image/assets/TEMP/43ce6330dd48a959b7a514d4e55e664fec7b69c7a7444e6a379f70a0f5eb768d?apiKey=346b924dbccd4280acc07bd2ffd516fd&width=1200 1200w, https://cdn.builder.io/api/v1/image/assets/TEMP/43ce6330dd48a959b7a514d4e55e664fec7b69c7a7444e6a379f70a0f5eb768d?apiKey=346b924dbccd4280acc07bd2ffd516fd&width=1600 1600w, https://cdn.builder.io/api/v1/image/assets/TEMP/43ce6330dd48a959b7a514d4e55e664fec7b69c7a7444e6a379f70a0f5eb768d?apiKey=346b924dbccd4280acc07bd2ffd516fd&width=2000 2000w, https://cdn.builder.io/api/v1/image/assets/TEMP/43ce6330dd48a959b7a514d4e55e664fec7b69c7a7444e6a379f70a0f5eb768d?apiKey=346b924dbccd4280acc07bd2ffd516fd&"
            className="img-3"
          />
        </div>
      </div>
      <style jsx>{`
        .div {
          background-color: #fff;
          display: flex;
          max-width: 480px;
          width: 100%;
          flex-direction: column;
          font-size: 14px;
          color: #222831;
          font-weight: 600;
          line-height: 129%;
          justify-content: center;
          margin: 0 auto;
        }
        .div-2 {
          background: linear-gradient(180deg, #fff 0%, #e5ffe3 100%);
          display: flex;
          width: 100%;
          padding-top: 40px;
          flex-direction: column;
        }
        .div-3 {
          display: flex;
          width: 100%;
          flex-direction: column;
          padding: 0 29px;
        }
        .div-4 {
          display: flex;
          gap: 20px;
          font-size: 24px;
          line-height: 110%;
        }
        .img {
          aspect-ratio: 1;
          object-fit: auto;
          object-position: center;
          width: 24px;
        }
        .div-5 {
          font-family: Poppins, sans-serif;
          flex-grow: 1;
          flex-basis: auto;
          margin: auto 0;
        }
        .div-6 {
          text-align: justify;
          font-family: Poppins, sans-serif;
          font-weight: 400;
          margin: 34px 28px 0;
        }
        .img-2 {
          aspect-ratio: 1.03;
          object-fit: auto;
          object-position: center;
          width: 100%;
          margin-top: 15px;
        }
        .div-7 {
          color: #2c2c2c;
          text-align: justify;
          font-family: Poppins, sans-serif;
          align-self: center;
          margin-top: 9px;
        }
        .div-8 {
          color: #2c2c2c;
          text-align: justify;
          font-family: Poppins, sans-serif;
          font-weight: 500;
          align-self: center;
          margin-top: 11px;
        }
        .img-3 {
          aspect-ratio: 1.19;
          object-fit: auto;
          object-position: center;
          width: 100%;
          margin-top: 15px;
        }
      `}</style>
    </>
  );
}


