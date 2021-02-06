var app = app || {};

app.config = (function() {

	'use strict';

	var config = {
		primaryDisplayCurrencies: ['BTC', 'CZK', 'EUR', 'GBP', 'LTC', 'USD', 'PHP'],
		supportEmail: 'cryptoterminal.eu@gmail.com',
		cache: {
			onAppStartClearOlderThan: 86400000,// milliseconds
		},
		debug: false,
		jsonRpcTcpSocketClient: {
			timeout: 10000,
		},
		primus: {
			reconnect: {
				max: 5000, // Number: The max delay before we try to reconnect.
				min: 500, // Number: The minimum delay before we try reconnect.
				retries: Infinity, // Number: How many times we should try to reconnect.
			},
		},
		qrCodes: {
			errorCorrectionLevel: 'M',
			margin: 0,
		},
		defaultLocale: 'en',
		numberFormats: {
			default: {
				BigNumber: {
					FORMAT: {
						decimalSeparator: '.',
						groupSeparator: ',',
						groupSize: 3,
					},
				},
				decimals: 2,
			},
			'CZK': {
				BigNumber: {
					FORMAT: {
						decimalSeparator: ',',
						groupSeparator: ' ',
						groupSize: 3,
					},
				},
				decimals: 2,
			},
		},
		numberPad: {
			keysMaxLength: 12,
		},
		screenSaver: {
			idleTime: 3 * 60 * 1000,
		},
		touch: {
			quick: {
				// Maximum time between touchstart and touchend; milliseconds.
				maxTime: 300,
				// Maximum percent of screen traveled for emitting "click" event.
				maxMovement: 2.5,
			},
			long: {
				// Delay before emitting "longtouchstart" event; milliseconds.
				delay: 450,
			},
			swipe: {
				minSpeed: 0.0025,// % of screen width / millisecond
				minMovementX: 12,// % screen width
				tolerance: 4,// % screen width
			},
		},
		// Preset amounts are displayed on the #pay screen as buttons.
		presets: {
			// Example:
			// 'CZK': ['150', '200']
		},
		numberOfSampleAddressesToShow: 5,
		settingsPin: {
			minLength: 1,
			unlockTime: 5 * 60 * 1000,
		},
		paymentRequests: {
			timeout: 5 * 60 * 1000,
			saveDelay: 5000,
		},
		paymentHistory: {
			list: {
				limit: 999,
			},
			export: {
				storagePath: 'file:///storage/emulated/0/',
				storageDirectory: 'download',
				extension: '.csv',
				dateFormat: 'DD-MM-YYYY_HHmmss'
			}
		},
		settings: [
			{
				name: 'debug',
				visible: false,
				default: false,
			},
			{
				name: 'developer',
				visible: false,
				default: false,
			},
			{
				name: 'getting-started-complete',
				visible: false,
				default: false,
			},
			{
				name: 'configurableCryptoCurrencies',
				visible: false,
				default: [],
			},
			{
				name: 'displayCurrency',
				label: function() {
					return app.i18n.t('settings.display-currency.label');
				},
				type: 'select',
				default: 'BTC',
				required: true,
				options: function() {
					var supportedDisplayCurrencies = app.util.getSupportedDisplayCurrencies();
					var sticky = config.primaryDisplayCurrencies;
					var rest = _.difference(supportedDisplayCurrencies, sticky);
					return _.map([].concat(sticky, [''], rest), function(code) {
						return {
							key: code,
							label: code,
							disabled: !code,
						};
					});
				},
				validateAsync: function(value, data, cb) {
					var displayCurrency = value;
					var provider = app.settings.get('exchangeRatesProvider');
					validateExchangeRatesDisplayCurrencyWithProvider(displayCurrency, provider, cb);
				},
			},
			{
				name: 'exchangeRatesProvider',
				label: function() {
					return app.i18n.t('settings.exchange-rates-provider.label');
				},
				type: 'select',
				required: true,
				default: 'coinbase',
				options: function() {
					return _.map(app.services.exchangeRates.providers, function(provider, key) {
						return {
							key: key,
							label: provider.label,
						};
					});
				},
				validateAsync: function(value, data, cb) {
					var displayCurrency = app.settings.get('displayCurrency');
					var provider = value;
					validateExchangeRatesDisplayCurrencyWithProvider(displayCurrency, provider, cb);
				},
			},
			{
				name: 'dateFormat',
				label: function() {
					return app.i18n.t('settings.date-format.label');
				},
				type: 'select',
				required: true,
				options: function() {
					return [
						{
							key: 'DD/MM/YYYY HH:mm:ss',
							label: moment().format('DD/MM/YYYY HH:mm:ss')
						},
						{
							key: 'MMMM Do YYYY, H:mm:ss A',
							label: moment().format('MMMM Do YYYY, H:mm:ss A')
						},
						{
							key: 'lll',
							label: moment().format('lll')
						},
						{
							key: 'LLLL',
							label: moment().format('LLLL')
						},
					];
				},
			},
			{
				name: 'theme',
				label: function() {
					return app.i18n.t('settings.theme.label');
				},
				type: 'select',
				default: 'default',
				required: true,
				options: function() {
					return [
						{
							key: 'default',
							label: function() {
								return app.i18n.t('settings.theme.option.default.label');
							},
						},
						{
							key: 'dark',
							label: function() {
								return app.i18n.t('settings.theme.option.dark.label');
							},
						},
					];
				},
			},
			{
				name: 'inAppAudio',
				label: function() {
					return app.i18n.t('settings.in-app-audio.label');
				},
				description: function() {
					return app.i18n.t('settings.in-app-audio.description');
				},
				type: 'checkbox',
				default: true,
			},
			{
				name: 'screenSaver',
				label: function() {
					return app.i18n.t('settings.screen-saver.label');
				},
				description: function() {
					return app.i18n.t('settings.screen-saver.description');
				},
				type: 'checkbox',
				default: true,
			},
		],
		recommendations: {
			mobileWallets: {
				android: [
					{
						name: 'Mycelium',
						paymentMethods: ['bitcoin'],
						url: 'https://play.google.com/store/apps/details?id=com.mycelium.wallet',
					},
					{
						name: 'Coinomi',
						paymentMethods: ['bitcoin', 'bitcoinTestnet', 'litecoin'],
						url: 'https://play.google.com/store/apps/details?id=com.coinomi.wallet',
					},
					{
						name: 'Eclair Wallet',
						paymentMethods: ['bitcoinLightning'],
						url: 'https://play.google.com/store/apps/details?id=fr.acinq.eclair.wallet.mainnet2',
					},
					{
						name: 'Zap Wallet',
						paymentMethods: ['bitcoinLightning'],
						url: 'https://play.google.com/store/apps/details?id=zapsolutions.zap',
					},
					{
						name: 'Lightning App',
						paymentMethods: ['bitcoinLightning'],
						url: 'https://play.google.com/store/apps/details?id=engineering.lightning.LightningMainnet',
					},
				],
				ios: [
					{
						name: 'BreadWallet (BRD)',
						paymentMethods: ['bitcoin'],
						url: 'https://apps.apple.com/us/app/brd-bitcoin-wallet-ethereum/id885251393',
					},
					{
						name: 'Coinomi',
						paymentMethods: ['bitcoin', 'bitcoinTestnet', 'litecoin'],
						url: 'https://apps.apple.com/us/app/coinomi-wallet/id1333588809',
					},
					{
						name: 'LoafWallet',
						paymentMethods: ['litecoin'],
						url: 'https://apps.apple.com/us/app/loafwallet/id1119332592?ls=1',
					},
					{
						name: 'Zap Wallet',
						paymentMethods: ['bitcoinLightning'],
						url: 'https://testflight.apple.com/join/P32C380R',
					},
					{
						name: 'Lightning App',
						paymentMethods: ['bitcoinLightning'],
						url: 'https://testflight.apple.com/join/xx23MrBp',
					},
				],
			},
		},
	};

	_.each(app.paymentMethods, function(paymentMethod) {
		if (paymentMethod.numberFormat) {
			config.numberFormats[paymentMethod.code] = paymentMethod.numberFormat;
		}
	});

	var validateExchangeRatesDisplayCurrencyWithProvider = function(displayCurrency, provider, done) {
		var paymentMethods = app.settings.getAcceptedPaymentMethods();
		async.each(paymentMethods, function(paymentMethod, next) {
			if (displayCurrency === paymentMethod.code) return next();
			app.services.exchangeRates.get({
				currencies: {
					from: paymentMethod.code,
					to: displayCurrency,
				},
				provider: provider,
			}, next);
		}, done);
	};

	return config;

})();
