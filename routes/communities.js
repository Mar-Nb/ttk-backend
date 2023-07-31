var express = require('express');
var router = express.Router();

const User = require('../models/users');
const Community = require('../models/communities');
const { checkBody } = require('../modules/checkBody');

/**
 * POST - Join a community
 */
router.post('/join', async (req, res) => {
	if (!checkBody(req.body, ['token', 'accessCode', 'name'])) {
		res.json({ result: false, error: 'Missing or invalid field' });
		return;
	}

	const { token, accessCode, name } = req.body;

	const commu = await Community.findOne({ name });
	if (commu.accessCode === accessCode) {
		const updateRes = await User.updateOne({ token }, { $push: { community: commu._id } });
		res.json({ result: updateRes.modifiedCount === 1 });
	} else {
		res.json({ result: false, error: 'Wrong access code' });
	}
});

const generateRandomAccessCode = (length) => {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let accessCode = '';
	for (let i = 0; i < length; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length);
		accessCode += characters[randomIndex];
	}
	return accessCode;
}

router.post('/create', async (req, res) => {
	const {
		name,
		localisation,
		description,
		photo,
		isPrivate,
	} = req.body;

	// Vérifier si il y a une commu avec le même nom dans la base de données
	const existingCommunity = await Community.findOne({ name });
	if (existingCommunity) {
		// Une commu avec le même nom existe déjà
		return res.json({ result: false, error: 'Une communauté avec le même nom existe déjà' });
	}

	const accessCode = generateRandomAccessCode(5);

	// Creation de la nouvelle communauté
	const newCommunity = new Community({
		name,
		localisation,
		accessCode,
		description,
		photo,
		creationDate: (new Date()),
		isPrivate,
	});

	newCommunity.save()
		.then(() => {
			res.json({ result: true });
		})
		.catch(err => {
			res.json({ result: false, error: err });
		});
});

module.exports = router;
