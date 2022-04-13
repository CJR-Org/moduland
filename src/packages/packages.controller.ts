import { Controller, Get, Render, Param, Post } from '@nestjs/common';
import { PackagesService } from './packages.service';

@Controller('pkg')
export class PackagesController {
    constructor(private packagesService: PackagesService) {}

    @Get('add')
    @Render('add_package.hbs')
    add_page() {
        return;
    }

    @Get('pull/:pkg_name')
    pull_package(@Param() params) {
        const { user, repo } = this.packagesService.fetch(params.pkg_name);
        return { url: `https://github.com/${user}/${repo}`, status: "success "};
    }

    @Get(':pkg_name')
    @Render('pkg.hbs')
    package_page(@Param() params) {
        const { user, repo, versions, files } = this.packagesService.fetch(params.pkg_name);
        this.packagesService.cache_versions(params.pkg_name, user, repo);
        this.packagesService.cache_files(params.pkg_name, user, repo, versions[0]);
        
        return { 
            name: params.pkg_name, 
            user, 
            repo, 
            version: versions[0], 
            install_version: "", 
            files: files[versions[0]]
        };
    }

    @Get(':pkg_name/versions')
    @Render('versions.hbs')
    versions_page(@Param() params) {
        const { versions } = this.packagesService.fetch(params.pkg_name);
        return { name: params.pkg_name, versions };
    }

    @Get(':pkg_name/:version')
    @Render('pkg.hbs')
    package_page_versioned(@Param() params) {
        const { user, repo, files } = this.packagesService.fetch(params.pkg_name);
        this.packagesService.cache_files(params.pkg_name, user, repo, params.version);
        
        return { 
            name: params.pkg_name, 
            user, 
            repo, 
            version: params.version, 
            install_version: ` ${params.version}`, 
            files: files[params.version] 
        };
    }

    @Post('/add/:pkg_name/:user/:repo')
    add_package(@Param() params) {
        this.packagesService.add(params.pkg_name, params.user, params.repo);
        this.packagesService.cache_versions(params.pkg_name, params.user, params.repo);

        return JSON.stringify({"url": `/pkg/${params.pkg_name}`, "status": "success"});
    }
}