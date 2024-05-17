import jwt from 'jsonwebtoken'

export const decodeToken = (auth) => {
  let response = {
    code: '',
    payload: '',
  }

  if (!auth) {
    response.code = 401,
    response.payload = 'Token no proporcionado.'
    return response;
  }

  const token = auth.split(' ')[1]; // Ignorar "Bearer" y obtener el token

  try {
    var decoded = jwt.verify(token, process.env.JWT_SECRET);
    response.code = 200;
    response.payload = decoded;
  } catch (error) {
    response.code = 401;
    response.payload = error;
  }

  return response;
}