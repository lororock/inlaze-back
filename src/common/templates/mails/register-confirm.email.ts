const registerConfirmEmail = (url: string) => `
<!DOCTYPE html>
<html lang="es">
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            color: #333;
            padding: 50px;
        }
        .container {
            background-color: #fff;
            margin: auto;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            max-width: 600px;
            text-align: center;
        }
        h1 {
            color: #007bff;
        }
        .button {
            background-color: #007bff;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            display: inline-block;
            margin-top: 20px;
        }
        p {
            line-height: 1.6;
        }
    </style>
    <title>Registro Exitoso</title>
</head>
<body>
    <div class="container">
        <h1>Bienvenido a INLAZE</h1>
        <p>¡Tu registro se ha completado con éxito!</p>
        <p>Como parte de tu registro, confirma tu solicitud en este enlace:</p>
        <a href="${url}" class="button">Confirmar registro</a>
    </div>
</body>
</html>
`;

export default registerConfirmEmail;
