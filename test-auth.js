// test-auth.js
const { registerLogic, loginLogic } = require('./src/controllers/authController');

async function testAuth() {
    console.log("=== PRUEBA DE AUTENTICACIÓN (ARGON2) ===");
    
    const email = "usuario@test.com";
    const password = "MiPasswordSeguro123";

    // 1. Simular Registro
    console.log("\n1. Registrando usuario...");
    const usuarioNuevo = await registerLogic(email, password);
    
    console.log("-> Hash Generado:", usuarioNuevo.master_hash);
    console.log("-> Salt Generada:", usuarioNuevo.kdf_salt);

    // 2. Simular Login Correcto
    console.log("\n2. Probando Login con contraseña CORRECTA...");
    const loginExitoso = await loginLogic(password, usuarioNuevo.master_hash);
    
    if (loginExitoso) console.log("✅ LOGIN APROBADO");
    else console.log("❌ ERROR: No reconoció la contraseña.");

    // 3. Simular Login Incorrecto
    console.log("\n3. Probando Login con contraseña INCORRECTA...");
    const loginFallido = await loginLogic("PasswordFalso", usuarioNuevo.master_hash);
    
    if (!loginFallido) console.log("✅ SISTEMA SEGURO: Rechazó la contraseña falsa.");
    else console.log("❌ ERROR GRAVE: Aceptó una contraseña falsa.");
}

testAuth();