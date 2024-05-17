import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET,
  }
});

//Get
export const getFile = async (req, res) => {
  try {
    const { key } = req.body;

    const data = await s3Client.send(
      new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET,
        Key: key
      })
    );
    if(data){
      res.json({url: `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`});
    }
    else {
      res.status(404).json({ error: 'Archivo no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Ocurrió un error al obtener el archivo: ' + error });
  }
}

//Put
export const postFile = async (req, res) => {
  try {
    const { key } = req.body;
    const file = req.files[0];

    // Llama a la operación de listado de objetos
    const data = await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET,
        Key: key,
        Body: file.buffer,
        ACL: 'public-read'
      })
    );
    if(data){
      res.json({url: `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`});
    }
    else {
      res.status(400).json({ error: 'Ocurrió un error al cargar el archivo.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Ocurrió un error al cargar el archivo: ' + error });
  }
}

export const deleteFile = async (req, res) => {
  try {
    const { key } = req.body;

    // Llama a la operación de listado de objetos
    const data = await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET,
        Key: key
      })
    );
    if(data){
      res.json({url: `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`});
    }
    else {
      res.status(400).json({ error: 'Ocurrió un error al eliminar el archivo.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Ocurrió un error al eliminar el archivo: ' + error });
  }
}
