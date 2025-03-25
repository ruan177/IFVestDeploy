exports.LogoutController =async (req, res) => {
    console.log("....deslogando")
    req.session.destroy();
    res.redirect('/usuario/login');
}