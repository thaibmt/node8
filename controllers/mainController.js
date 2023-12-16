const express = require('express');
const bcrypt = require("bcryptjs");
const router = express.Router();
const User = require('../models/user')
const Fruirt = require('../models/fruit')
const isLogged = require('../middleware/isLogged');
const roleAdmin = require('../middleware/roleAdmin');
// Index page
router.get('/', (req, res) => {
    res.render('index');
});
router.get('/login', (req, res) => {
    let error = req.session.error;
    delete req.session.error;
    if (req.session.user) {
        return res.redirect("/dashboard");
    }
    res.render('login', { error, email: '' });
});
router.get('/register', (req, res) => {
    res.render('register', { error: '', email: '', username: '' });
});
router.get('/logout', (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            throw error;
        }
        res.redirect("/");
    });
});
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            req.session.error = "Thông tin đăng nhập không đúng.";
            return res.redirect("/login");
        }
        const hasUser = await bcrypt.compare(password, user.password);
        if (!hasUser) {
            req.session.error = "Thông tin đăng nhập không đúng.";
            return res.redirect("/login");
        }
        req.session.user = user;
        res.redirect("/dashboard");
    } catch (error) {
        res.redirect('/login', { error: 'Có lỗi xảy ra khi đăng nhập', email });
    }
});
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        // Kiểm tra nguời dùng tồn tại hay chưa
        let user = await User.findOne({ email, password });
        if (user) {
            return res.render('/register', { error: 'Nguời dùng đã tồn tại', email });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        user = new User({
            username,
            email,
            password: hashedPassword
        });
        await user.save();
        res.redirect("/login");
    } catch (error) {
        res.redirect('/register', { error: 'Có lỗi xảy ra khi đăng ký', email });
    }
});
// dashboard
router.get('/dashboard', isLogged, async (req, res) => {

    const username = req.session.user.name;
    const role = req.session.user.role;
    const error = req.session.error;
    const success = req.session.success;
    const fruits = await Fruirt.find({});
    delete req.session.error;
    delete req.session.success;
    res.render("dashboard", { fruits: fruits, username: username, role: role, error: error, success: success });
});
router.get('/fruits/:id', isLogged, async (req, res) => {
    const id = req.params.id;
    const fruit = await Fruirt.findOne({ _id: id });
    res.render("view", { fruit: fruit });
});
router.post('/fruits/delete/:id', isLogged, roleAdmin, async (req, res) => {
    const id = req.params.id;
    try {
        await Fruirt.deleteOne({ _id: id });
        req.session.success = true
    } catch (err) {
        req.session.error = true
    }
    res.redirect("/dashboard");
});
router.post('/fruits', isLogged, roleAdmin, async (req, res) => {
    const { title, price, description } = req.body;
    let fruit = new Fruirt({
        title,
        price,
        description
    });
    try {
        await fruit.save();
        req.session.success = true
    } catch (err) {
        req.session.error = true
    }
    res.redirect("/dashboard");
});
router.post('/fruits/update/:id', isLogged, roleAdmin, async (req, res) => {
    const { title, price, description } = req.body;
    const id = req.params.id;
    try {
        await Fruirt.updateOne({ _id: id }, { title, price, description });
        req.session.success = true
    } catch (err) {
        req.session.error = true
    }
    res.redirect("/dashboard");
});
module.exports = router;
