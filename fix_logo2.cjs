const fs = require('fs');
let code = fs.readFileSync('src/components/JobPDFModal.tsx', 'utf8');

// fix the mangled import
code = code.replace(
  "import React, { useEffect, useRef } from 'react';\nimport logoImage from '../assets/logo.png';\n//{ useRef, useState, useEffect } from 'react';",
  "import React, { useRef, useState, useEffect } from 'react';\nimport logoImage from '../assets/logo.png';"
);

fs.writeFileSync('src/components/JobPDFModal.tsx', code);
console.log('Fixed imports.');
