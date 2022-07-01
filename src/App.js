import "./App.css";
import S3 from "react-aws-s3";
import { useState, useEffect } from "react";
import AWS from "aws-sdk";

window.Buffer = window.Buffer || require("buffer").Buffer;

function App() {
  const S3_BUCKET = "react-bucket-my-app";
  const REACT_APP_DIR_NAME = "photos";
  const REGION = "us-east-1";
  const ACCESS_KEY = "AKIAVFYA5WWIIUEEBZME";
  const SECRET_ACCESS_KEY = "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";
  const BASE_URL = "https://react-bucket-my-app.s3.amazonaws.com";

  AWS.config.update({
    apiVersion: "2012-10-17",
    credentials: {
      accessKeyId: ACCESS_KEY,
      secretAccessKey: SECRET_ACCESS_KEY,
    },
  });

  const s3sdk = new AWS.S3({
    apiVersion: "2012-10-17",
    params: { Bucket: S3_BUCKET },
  });

  const uploadConfig = {
    bucketName: S3_BUCKET,
    dirName: REACT_APP_DIR_NAME /* optional */,
    region: REGION,
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_ACCESS_KEY,
    s3Url: BASE_URL,
  };

  const deleteConfig = {
    bucketName: S3_BUCKET,
    dirName: REACT_APP_DIR_NAME /* optional */,
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_ACCESS_KEY,
    s3Url: BASE_URL,
  };

  const [selectedFile, setSelectedFile] = useState(null);
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    viewAlbum(REACT_APP_DIR_NAME);
  }, []);

  const refreshAlbum = () => {
    document.location.reload();
  };

  const handleMouseOver = (e) => {
    if (e.target.tagName == 'DIV')
      document.getElementById(e.target.getAttribute("name")).className =
      "delete-btn-visible";
  };

  const handleMouseOut = (e) => {
    if (e.target.tagName == 'DIV')
      document.getElementById(e.target.getAttribute("name")).className =
        "delete-btn-hidden";
      
  };

  const handleFileInput = (e) => {
    e.preventDefault();
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async (file) => {
    const ReactS3Client = new S3(uploadConfig);
    ReactS3Client.uploadFile(file, file.name)
      .then(() => {
        refreshAlbum();
      })
      .catch(console.error());
  };

  const onClickDeletePic = (e) => {
    handleDelete(e.target.name);
  };

  const handleDelete = async (file) => {
    const ReactS3Client = new S3(deleteConfig);
    ReactS3Client.deleteFile(file)
      .then(() => {
        refreshAlbum();
      })
      .catch(console.error());
  };

  const viewAlbum = async (albumName) => {
    albumName = REACT_APP_DIR_NAME;
    const albumKey = encodeURIComponent(albumName) + "/";
    s3sdk.listObjects({ Prefix: albumKey }, function (err, data) {
      if (err) {
        return alert("There was an error viewing your album: " + err.message);
      }
      const photos = data.Contents;
      setPhotos(photos);
    });
  };

  return (
    <div className="App">
      <div className="main-header">React S3 Image Gallery</div>
      <div className="input-container">
        <input type="file" onChange={handleFileInput} />
        <button onClick={() => handleUpload(selectedFile)}>Upload to S3</button>
      </div>
      <div className="gallery-container">
        <div className="album-name-heading">Album: '{REACT_APP_DIR_NAME}'</div>
        <div className="images-container">
          {photos.map((photo) => {
            let fileSrc = BASE_URL + "/" + encodeURIComponent(photo.Key);
            let fileNameNoDir = encodeURIComponent(photo.Key).replace(
              REACT_APP_DIR_NAME + "%2F",
              ""
            );
            return (
              <div
                className="img-btn-container"
                onMouseOver={handleMouseOver}
                onMouseLeave={handleMouseOut}
                name={fileNameNoDir}
                key={`div ${photo.Key}`}
              >
                <img className="img" key={photo.Key} src={fileSrc} />

                <button
                  className="delete-btn-hidden"
                  name={fileNameNoDir}
                  onClick={onClickDeletePic}
                  id={fileNameNoDir}
                  key={`btn ${photo.Key}`}
                >
                  Delete
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;

