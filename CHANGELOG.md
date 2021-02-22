# [1.5.0](https://github.com/stencila/jesta/compare/v1.4.0...v1.5.0) (2021-02-22)


### Bug Fixes

* **CLI:** Use import and export of decode and encode ([79b56c2](https://github.com/stencila/jesta/commit/79b56c28df20d671891538781632361076bf2774))
* **CLI:** Use plugin name for persisting history ([4e5dda6](https://github.com/stencila/jesta/commit/4e5dda6acb4d63149f3d0e08c18abb2c005351f8))
* **Directory paths:** Return for Windows ([03bf3c3](https://github.com/stencila/jesta/commit/03bf3c3ea495e9094a728aa00af2ddf55ef80e62))
* **IO:** Use import and export functions for convert ([8244b67](https://github.com/stencila/jesta/commit/8244b67df81bce176241121ee7bfac6f6a717830))
* **Read:** Add stdio:// URL handling ([10d4f85](https://github.com/stencila/jesta/commit/10d4f85fe5d42e64d1a42c1e896c3dcd32775fc9))
* **Read:** Various fixes and improvements; added tests ([c0ad9d0](https://github.com/stencila/jesta/commit/c0ad9d0dbe9b904f493fb2efd1d2c5261f768caf))
* **Write:** Add stdio:// URL handling ([2f4499c](https://github.com/stencila/jesta/commit/2f4499cface24ef83959ef0ec1a85214c64d2ab7))


### Features

* **CLI:** Remove import and export; add convert tests for stdio ([9e53510](https://github.com/stencila/jesta/commit/9e535109a7beccfa52513eaf7f5450b7eb2c647a))
* **Sessions:** Allow for multiple sessions; run methods withing stencil context ([2bf9905](https://github.com/stencila/jesta/commit/2bf9905dcaa833ce68371324a23c0f4a164d4ad2))

# [1.4.0](https://github.com/stencila/jesta/compare/v1.3.0...v1.4.0) (2021-02-12)


### Bug Fixes

* Typings and tests ([493103f](https://github.com/stencila/jesta/commit/493103ff74d0843cc252b241ba3d852f7fc245e8))
* **Cache:** Use persistent dir; cleanup after set ([60be842](https://github.com/stencila/jesta/commit/60be842bae939d9faf51d3f78f8131ac6ae7fb30))
* **CLI:** Exit on success ([dd1e082](https://github.com/stencila/jesta/commit/dd1e08205bca9fc5e8894601684cff550d463bc9))
* **Compile:** Allow unnamespaced tags ([3a0c52c](https://github.com/stencila/jesta/commit/3a0c52c6d6861aa791bec97e39f9230e6c51d1eb))
* **Compile:** Tidy up and add tests ([dab52bd](https://github.com/stencila/jesta/commit/dab52bdc4657f3edab6bdb12814aec15d1c777b7))
* **Read:** Temporarily default to JSON ([68d10d5](https://github.com/stencila/jesta/commit/68d10d57049530e050e0ac9c3308085fd0f43b87))


### Features

* **Funcs & call:** Add method for listing and calling functions ([74b3166](https://github.com/stencila/jesta/commit/74b3166c0692c44ee0b27fd53b586b41534d7244))

# [1.3.0](https://github.com/stencila/jesta/compare/v1.2.0...v1.3.0) (2021-02-03)


### Bug Fixes

* **Execute:** Support CodeExpressions ([1da0b90](https://github.com/stencila/jesta/commit/1da0b90f88573efe0f057726ca526b899eca94a0))


### Features

* **Delete:** Add delete method ([2362c62](https://github.com/stencila/jesta/commit/2362c62776546c37f9b1d0ed93afd2d66391eb99))

# [1.2.0](https://github.com/stencila/jesta/compare/v1.1.0...v1.2.0) (2021-02-03)


### Bug Fixes

* **Javascript:** The ?? operator is not available in Node 12 ([305b6c9](https://github.com/stencila/jesta/commit/305b6c998aab73dfbef23b651ea9e8f73bfcfc5d))


### Features

* **Binaries:** Include binaries in releases ([04723d5](https://github.com/stencila/jesta/commit/04723d5fdbe02b82eb73db7d3657f26f546f06bd))

# [1.1.0](https://github.com/stencila/jesta/compare/v1.0.1...v1.1.0) (2021-01-31)


### Bug Fixes

* **Execute:** Detect errors across runtime boundary ([15ea4f5](https://github.com/stencila/jesta/commit/15ea4f5ae7a9b63838212346d6dc709c1a4714c1))


### Features

* **Interactive modes:** Record history ([9d64dbf](https://github.com/stencila/jesta/commit/9d64dbf730b916c5c40157d80cec594a043a36b5))

## [1.0.1](https://github.com/stencila/jesta/compare/v1.0.0...v1.0.1) (2021-01-28)


### Bug Fixes

* **Index:** Add shebang ([499be71](https://github.com/stencila/jesta/commit/499be715a035c007d6175c7a3af3a2a775efa2fc))

# 1.0.0 (2021-01-28)


### Bug Fixes

* Export symbols ([6d4aca6](https://github.com/stencila/jesta/commit/6d4aca617ef2896e5e4738c09ed004b09f0cdc2e))
* **Build:** Only build if needed ([9c015fa](https://github.com/stencila/jesta/commit/9c015fa6ddde48f4ec67e4042e4c70d47ba29dd7))
* **Build:** Use spawnSync ([91e1e2d](https://github.com/stencila/jesta/commit/91e1e2d08aaf5d760d9930a897a8e22d9d244660))
* **CLI:** Calculate calls properly for pipe ([65e1680](https://github.com/stencila/jesta/commit/65e1680b5973cab45e812d5326eaa30998b2e9e5))
* **CLI:** Fix command used when in dev mode ([fcacecc](https://github.com/stencila/jesta/commit/fcacecc26bc6fa15c5ff1e965eda810e01317748))
* **CLI:** Handle missing subcommand ([8168e35](https://github.com/stencila/jesta/commit/8168e35495f5b164576b99ff88540fea1dc4d7e7))
* **CLI:** Handling of options ([0377cb9](https://github.com/stencila/jesta/commit/0377cb95b830a26dfcb4ee2111f92d0736dbb4ca))
* **CLI:** Output selected node ([b940861](https://github.com/stencila/jesta/commit/b9408610c3eff1b4a5e84085a54fe5fc4fcb15d9))
* **CLI & Dispatch:** Improve parsing, handling and docs for options ([441bba0](https://github.com/stencila/jesta/commit/441bba0ae014886cb0357b14fae2c75a69919c78))
* **Deps:** Update Schema version ([c152afe](https://github.com/stencila/jesta/commit/c152afebf25928777f45c72354ac5cf1aba9c6d0))
* **Encode:** Format defaults to JSON ([ecf1ab3](https://github.com/stencila/jesta/commit/ecf1ab32ead0b16ee9afd4475734590e88a5e240))
* **Manifest:** Populate from package.json ([271b218](https://github.com/stencila/jesta/commit/271b218ccdaa09629ec7d70c0640155f021adead))
* **Manifest:** Use absolute path for command ([f02d6d2](https://github.com/stencila/jesta/commit/f02d6d27dccb393223a22109a69b002593577b5c))
* **Mutate:** Handle undefined ([a153aa5](https://github.com/stencila/jesta/commit/a153aa534719a74b07ed383cedaaa49ba1cb7dd8))
* **Params:** Use consitent format param and allow for missing ([742844d](https://github.com/stencila/jesta/commit/742844d70f84e99dfbc430ad3e8458c3fb8da663))
* **Vars:** Exclude globals ([79d7911](https://github.com/stencila/jesta/commit/79d7911bb6c25408193f09030bf8fcd8e28521f3))


### Features

* Initial commit ([86aee9d](https://github.com/stencila/jesta/commit/86aee9dc88579ecf74348cdd56f60d89f421e5d5))
* **Dispatch:** Implement dispatch; add more methods ([058a7b7](https://github.com/stencila/jesta/commit/058a7b79ee66079ab9dbb0c84332a2ab3e29f472))
* **Execute:** Call predecessor methods if necessary ([f26e0ef](https://github.com/stencila/jesta/commit/f26e0efbc037317eb0e69e5630723e37e174ff17))
* **Execute:** Implement execute and add vars, get, set, methods ([aff8a0f](https://github.com/stencila/jesta/commit/aff8a0f08afe16b7d2673f9001e90d88d4a7e0d1))
* **Pipe:** Add pipe method; do not use methods directly, only via dispatcher ([c6f4fa3](https://github.com/stencila/jesta/commit/c6f4fa359d9c713ef5b8621625e9965dbecbf2c3))
* **Register:** Implement registration of plugin ([711154a](https://github.com/stencila/jesta/commit/711154afa91b9cefdc1b13745614da6672540b8b))
* **Select:** Default to jspath ([fb68fdc](https://github.com/stencila/jesta/commit/fb68fdcf99edd99b40044989cb672c0b94936186))
* **Select & Execute:** Add --interact option ([356da75](https://github.com/stencila/jesta/commit/356da75c5242d65d41bd0ed0a15e775355beb815))
* **Serve:** Handle interrupt signals ([f81fcea](https://github.com/stencila/jesta/commit/f81fcea79bdd1920e6de623c8a9490f227b070db))
* **Serve:** Implement serve function ([c9bede3](https://github.com/stencila/jesta/commit/c9bede3a7b1fee3f89a9e037e016f9f06876b839))
* **Validate, Compile, Build:** Add force option ([fc51f3a](https://github.com/stencila/jesta/commit/fc51f3ad3c402383fd89ac961326df247b5f96eb))
