/* Load this script using conditional IE comments if you need to support IE 7 and IE 6. */

window.onload = function() {
	function addIcon(el, entity) {
		var html = el.innerHTML;
		el.innerHTML = '<span style="font-family: \'appicon\'">' + entity + '</span>' + html;
	}
	var icons = {
			'appicon-checkbox-9' : '&#xe000;',
			'appicon-checkbox-8' : '&#xe001;',
			'appicon-checkbox-7' : '&#xe002;',
			'appicon-checkbox-6' : '&#xe003;',
			'appicon-checkbox-5' : '&#xe004;',
			'appicon-checkbox-4' : '&#xe005;',
			'appicon-checkbox-3' : '&#xe006;',
			'appicon-checkbox-2' : '&#xe007;',
			'appicon-checkbox-1' : '&#xe008;',
			'appicon-home-2' : '&#xe009;',
			'appicon-home-1' : '&#xe00a;',
			'appicon-help-4' : '&#xe00b;',
			'appicon-help-3' : '&#xe00c;',
			'appicon-help-2' : '&#xe00d;',
			'appicon-help-1' : '&#xe00e;',
			'appicon-gear-2' : '&#xe00f;',
			'appicon-gear-1' : '&#xe010;',
			'appicon-fullscreen-3' : '&#xe011;',
			'appicon-fullscreen-2' : '&#xe012;',
			'appicon-fullscreen-1' : '&#xe013;',
			'appicon-forbidden-3' : '&#xe014;',
			'appicon-forbidden-2' : '&#xe015;',
			'appicon-forbidden-1' : '&#xe016;',
			'appicon-folder-remove-2' : '&#xe017;',
			'appicon-folder-remove-1' : '&#xe018;',
			'appicon-folder-4' : '&#xe019;',
			'appicon-folder-3' : '&#xe01a;',
			'appicon-folder-2' : '&#xe01b;',
			'appicon-folder-1' : '&#xe01c;',
			'appicon-flag-7' : '&#xe01d;',
			'appicon-flag-6' : '&#xe01e;',
			'appicon-flag-5' : '&#xe01f;',
			'appicon-flag-4' : '&#xe020;',
			'appicon-flag-3' : '&#xe021;',
			'appicon-flag-2' : '&#xe022;',
			'appicon-flag-1' : '&#xe023;',
			'appicon-filter-1' : '&#xe024;',
			'appicon-file-text-4' : '&#xe025;',
			'appicon-file-text-3' : '&#xe026;',
			'appicon-file-text-2' : '&#xe027;',
			'appicon-file-text-1' : '&#xe028;',
			'appicon-file-new-1' : '&#xe029;',
			'appicon-file-image-1' : '&#xe02a;',
			'appicon-favorite-6' : '&#xe02b;',
			'appicon-favorite-5' : '&#xe02c;',
			'appicon-favorite-4' : '&#xe02d;',
			'appicon-favorite-3' : '&#xe02e;',
			'appicon-favorite-2' : '&#xe02f;',
			'appicon-favorite-1' : '&#xe030;',
			'appicon-eye-2' : '&#xe031;',
			'appicon-eye-1' : '&#xe032;',
			'appicon-email-6' : '&#xe033;',
			'appicon-email-5' : '&#xe034;',
			'appicon-email-4' : '&#xe035;',
			'appicon-email-3' : '&#xe036;',
			'appicon-email-2' : '&#xe037;',
			'appicon-email-1' : '&#xe038;',
			'appicon-edit-2' : '&#xe039;',
			'appicon-edit-1' : '&#xe03a;',
			'appicon-document-file-2' : '&#xe03b;',
			'appicon-document-file-1' : '&#xe03c;',
			'appicon-crosshair-3' : '&#xe03d;',
			'appicon-crosshair-2' : '&#xe03e;',
			'appicon-crosshair-1' : '&#xe03f;',
			'appicon-copy-2' : '&#xe040;',
			'appicon-copy-1' : '&#xe041;',
			'appicon-caret-2a' : '&#xe042;',
			'appicon-caret-2' : '&#xe043;',
			'appicon-caret-1' : '&#xe044;',
			'appicon-calendar-3' : '&#xe045;',
			'appicon-calendar-2' : '&#xe046;',
			'appicon-calendar-1' : '&#xe047;',
			'appicon-bookmark-8' : '&#xe048;',
			'appicon-bookmark-7' : '&#xe049;',
			'appicon-bookmark-6' : '&#xe04a;',
			'appicon-bookmark-5' : '&#xe04b;',
			'appicon-bookmark-4' : '&#xe04c;',
			'appicon-bookmark-3' : '&#xe04d;',
			'appicon-bookmark-2' : '&#xe04e;',
			'appicon-bookmark-1' : '&#xe04f;',
			'appicon-arrow-17' : '&#xe050;',
			'appicon-arrow-16' : '&#xe051;',
			'appicon-arrow-15' : '&#xe052;',
			'appicon-arrow-14' : '&#xe053;',
			'appicon-arrow-13' : '&#xe054;',
			'appicon-arrow-12' : '&#xe055;',
			'appicon-arrow-11' : '&#xe056;',
			'appicon-arrow-10' : '&#xe057;',
			'appicon-arrow-9' : '&#xe058;',
			'appicon-arrow-8' : '&#xe059;',
			'appicon-arrow-7' : '&#xe05a;',
			'appicon-arrow-6' : '&#xe05b;',
			'appicon-arrow-5' : '&#xe05c;',
			'appicon-arrow-4' : '&#xe05d;',
			'appicon-arrow-3' : '&#xe05e;',
			'appicon-arrow-2' : '&#xe05f;',
			'appicon-arrow-1' : '&#xe060;',
			'appicon-add-folder-2' : '&#xe061;',
			'appicon-add-folder-1' : '&#xe062;',
			'appicon-trash-can-7' : '&#xe063;',
			'appicon-trash-can-6' : '&#xe064;',
			'appicon-trash-can-5' : '&#xe065;',
			'appicon-trash-can-4' : '&#xe066;',
			'appicon-trash-can-3' : '&#xe067;',
			'appicon-trash-can-2' : '&#xe068;',
			'appicon-trash-can-1' : '&#xe069;',
			'appicon-tag-2' : '&#xe06a;',
			'appicon-tag-1' : '&#xe06b;',
			'appicon-printer-4' : '&#xe06c;',
			'appicon-printer-3' : '&#xe06d;',
			'appicon-printer-2' : '&#xe06e;',
			'appicon-printer-1' : '&#xe06f;',
			'appicon-plus-2' : '&#xe070;',
			'appicon-plus-1' : '&#xe071;',
			'appicon-pin-4' : '&#xe072;',
			'appicon-pin-3' : '&#xe073;',
			'appicon-pin-2' : '&#xe074;',
			'appicon-pin-1' : '&#xe075;',
			'appicon-pencil-6' : '&#xe076;',
			'appicon-pencil-2' : '&#xe077;',
			'appicon-note-16' : '&#xe078;',
			'appicon-note-15' : '&#xe079;',
			'appicon-note-14' : '&#xe07a;',
			'appicon-note-13' : '&#xe07b;',
			'appicon-note-12' : '&#xe07c;',
			'appicon-note-11' : '&#xe07d;',
			'appicon-note-10' : '&#xe07e;',
			'appicon-note-9' : '&#xe07f;',
			'appicon-note-8' : '&#xe080;',
			'appicon-note-7' : '&#xe081;',
			'appicon-note-6' : '&#xe082;',
			'appicon-note-5' : '&#xe083;',
			'appicon-note-4' : '&#xe084;',
			'appicon-note-3' : '&#xe085;',
			'appicon-note-2' : '&#xe086;',
			'appicon-note-1' : '&#xe087;',
			'appicon-minus-2' : '&#xe088;',
			'appicon-minus-1' : '&#xe089;',
			'appicon-magnifier-1r' : '&#xe08a;',
			'appicon-magnifier-1f' : '&#xe08b;',
			'appicon-magnifier-1' : '&#xe08c;',
			'appicon-magic-6' : '&#xe08d;',
			'appicon-magic-5' : '&#xe08e;',
			'appicon-magic-4' : '&#xe08f;',
			'appicon-magic-3' : '&#xe090;',
			'appicon-magic-2' : '&#xe091;',
			'appicon-magic-1' : '&#xe092;',
			'appicon-logout-3' : '&#xe093;',
			'appicon-logout-2' : '&#xe094;',
			'appicon-logout-1' : '&#xe095;',
			'appicon-login-3' : '&#xe096;',
			'appicon-login-2' : '&#xe097;',
			'appicon-login-1' : '&#xe098;',
			'appicon-lock-6' : '&#xe099;',
			'appicon-lock-5' : '&#xe09a;',
			'appicon-lock-4' : '&#xe09b;',
			'appicon-lock-3' : '&#xe09c;',
			'appicon-lock-2' : '&#xe09d;',
			'appicon-lock-1' : '&#xe09e;',
			'appicon-link-1' : '&#xe09f;',
			'appicon-key-4' : '&#xe0a0;',
			'appicon-key-3' : '&#xe0a1;',
			'appicon-key-2' : '&#xe0a2;',
			'appicon-key-1' : '&#xe0a3;',
			'appicon-info-4' : '&#xe0a4;',
			'appicon-info-3' : '&#xe0a5;',
			'appicon-info-2' : '&#xe0a6;',
			'appicon-info-1' : '&#xe0a7;',
			'appicon-inbox-5' : '&#xe0a8;',
			'appicon-inbox-4' : '&#xe0a9;',
			'appicon-inbox-3' : '&#xe0aa;',
			'appicon-inbox-2' : '&#xe0ab;',
			'appicon-inbox-1' : '&#xe0ac;',
			'appicon-chevron-2-up' : '&#xe0ad;',
			'appicon-chevron-2-right' : '&#xe0ae;',
			'appicon-chevron-2-left' : '&#xe0af;',
			'appicon-chevron-2-down' : '&#xe0b0;',
			'appicon-chevron-1-up' : '&#xe0b1;',
			'appicon-chevron-1-right' : '&#xe0b2;',
			'appicon-chevron-1-left' : '&#xe0b3;',
			'appicon-chevron-1-down' : '&#xe0b4;',
			'appicon-check-mark-5' : '&#xe0b5;',
			'appicon-check-mark-4' : '&#xe0b6;',
			'appicon-check-mark-3' : '&#xe0b7;',
			'appicon-check-mark-2' : '&#xe0b8;',
			'appicon-check-mark-1' : '&#xe0b9;',
			'appicon-checkbox-20' : '&#xe0ba;',
			'appicon-checkbox-19' : '&#xe0bb;',
			'appicon-checkbox-18' : '&#xe0bc;',
			'appicon-checkbox-17' : '&#xe0bd;',
			'appicon-checkbox-16' : '&#xe0be;',
			'appicon-checkbox-15' : '&#xe0bf;',
			'appicon-checkbox-14' : '&#xe0c0;',
			'appicon-checkbox-13' : '&#xe0c1;',
			'appicon-checkbox-12' : '&#xe0c2;',
			'appicon-checkbox-11' : '&#xe0c3;',
			'appicon-checkbox-10' : '&#xe0c4;',
			'appicon-save-7' : '&#xe0c5;',
			'appicon-save-6' : '&#xe0c6;',
			'appicon-save-5' : '&#xe0c7;',
			'appicon-save-4' : '&#xe0c8;',
			'appicon-save-3' : '&#xe0c9;',
			'appicon-save-2' : '&#xe0ca;',
			'appicon-save-1' : '&#xe0cb;',
			'appicon-plus-3' : '&#xe0cc;',
			'appicon-map-1' : '&#xe0cd;',
			'appicon-map-2' : '&#xe0ce;',
			'appicon-time-5' : '&#xe0cf;',
			'appicon-time-4' : '&#xe0d0;',
			'appicon-time-3' : '&#xe0d1;',
			'appicon-time-2' : '&#xe0d2;',
			'appicon-time-1' : '&#xe0d3;',
			'appicon-tools-5' : '&#xe0d4;',
			'appicon-tools-4' : '&#xe0d5;',
			'appicon-tools-3' : '&#xe0d6;',
			'appicon-tools-2' : '&#xe0d7;',
			'appicon-tools-1' : '&#xe0d8;',
			'appicon-warning-3' : '&#xe0d9;',
			'appicon-warning-2' : '&#xe0da;',
			'appicon-warning-1' : '&#xe0db;',
			'appicon-warning-4' : '&#xe0dc;',
			'appicon-user-13' : '&#xe0dd;',
			'appicon-user-15' : '&#xe0de;',
			'appicon-user-14' : '&#xe0df;',
			'appicon-user-12' : '&#xe0e0;',
			'appicon-user-11' : '&#xe0e1;',
			'appicon-user-10' : '&#xe0e2;',
			'appicon-user-9' : '&#xe0e3;',
			'appicon-user-8' : '&#xe0e4;',
			'appicon-user-7' : '&#xe0e5;',
			'appicon-user-6' : '&#xe0e6;',
			'appicon-user-5' : '&#xe0e7;',
			'appicon-user-4' : '&#xe0e8;',
			'appicon-user-3' : '&#xe0e9;',
			'appicon-user-2' : '&#xe0ea;',
			'appicon-user-1' : '&#xe0eb;',
			'appicon-caret-2-up' : '&#xe0ec;',
			'appicon-caret-2-down' : '&#xe0ed;'
		},
		els = document.getElementsByTagName('*'),
		i, attr, html, c, el;
	for (i = 0; ; i += 1) {
		el = els[i];
		if(!el) {
			break;
		}
		attr = el.getAttribute('data-icon');
		if (attr) {
			addIcon(el, attr);
		}
		c = el.className;
		c = c.match(/appicon-[^\s'"]+/);
		if (c && icons[c[0]]) {
			addIcon(el, icons[c[0]]);
		}
	}
};