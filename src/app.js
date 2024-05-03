// Importamos las dependencias 
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const { Strategy } = require('passport-google-oauth20');
const {getUserById, createUser} = require('./mongo.js');

const app = express();

// Invocamos a nuestro GoogleCloudId y nuestro GoogleCloudSecret y creamos nuestro sessionSecret
// Estos parametros los obtenemos de cloud.google.com
// En la página principal, nos dirigimos a la esquina superior derecha y seleccionamos "console"
// Una vez cargo console, nos dirigimos al menu de la esquina superior izquierda, clickeamos en APIs y seleccionamos "credentials"
// Cargado credentials, creamos un nuevo proyecto y le asignamos un nombre (ubicación lo dejamos en blanco)
// Luego cargamos el nuevo proyecto y configuramos la pagina de consentimiento
// Seleccionamos Externo en user Type
// Le asignamos un nombre a la app, cargamos un correo para que se comunique el usuario y un correo de contacto de desarrollador
// No es necesario asignar permisos, asique guardamos y continuamos y hacemos lo mismo en usuarios de prueba
// Retornamos a Credenciales y clickeamos en "+ crear credenciales"
// Seleccionamos "Id de cliente de OAuth" y seleccionamos Web App en el tipo de aplicación
// Le asignamos un nombre y le pasamos la "URI de redireccionamiento autorizada" http://localhost:8080/auth/google/callback
// Una vez creado el cliente de OAuth, ya podemos obtener ID de Cliente de Google y el Secret


const GoogleCloudId = "miCloudID";
const GloogleCloudSecret = "miCloudSecret";
const sessionSecret = "miSessionSecret";

// Creamos la nueva estrategia de google y le pasamos el clientID, el ClientSecret y el CallBackURL

passport.use('google', new Strategy(
    {
        clientID: GoogleCloudId,
        clientSecret: GloogleCloudSecret,
        callbackURL: "http://localhost:8080/auth/google/callback"
    }, async (accesstoken, refreshtoken, profile, done) => {
        if(await getUserById(profile.id)){
            console.log('El usuario ya existe')
        } else {
            createUser(profile)
        }
        return done(null, profile)
    }
))

// Iniciamos serializando y deszerializando al user para guardarlo

passport.serializeUser((user, done) => {
    done(null, user)
})

passport.deserializeUser((user, done) => {
    done(null, user)
})

// Creamos el middleware de la sesión

app.use(session({
    secret: sessionSecret,
    resave: true,
    saveUninitialized: true,
    cookie: {maxAge: 1000*60*60} // 1 hora
}))

// Creamos el middleware de passport

app.use(passport.initialize());
app.use(passport.session());

// Y comenzamos a crear nuestra app

app.get('/', (req, res) => {
    res.send('<h1>Por favor navega hacia /auth/google para iniciar sesión</h1>')
})

//Pasamos al metodo de autenticación de google. NO TE OLVIDES DEL SCOPE porque no te va a dejar avanzar en la autenticación

app.get('/auth/google', passport.authenticate('google', {scope: ['profile']}))

// Una vez iniciada sesión, le pasamos el callback para redirigirnos a perfil

app.get('/auth/google/callback', passport.authenticate('google', {failureRedirect: '/'}),
    (req, res) => {
        res.redirect('/perfil')
})

// Creamos la pestaña de perfil

app.get('/perfil', (req, res) => {
    if(req.isAuthenticated()){
        res.send(`<h1>Te loggeaste con Éxito:</h1><span>${JSON.stringify(req.user, null, 2)}</span>`)
    } else {
        res.redirect('/')
    }
})

// Cerramos la sesión

app.get('/logout', (req, res) => {
    req.logout((err) =>{
        if(err){
            return next(err)
        }
    });
    res.redirect('/logoutSuccess')
})

app.get('/logoutSuccess', (req, res) => {
    res.send("<h1>Cerraste la sesión con éxito</h1>")
})

app.listen(8080, () => {
    console.log('Iniciaste el servidor en el puerto 8080')
})