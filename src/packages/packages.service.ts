import { Injectable } from '@nestjs/common';
import { join } from 'path';

const fetch = require('node-fetch');
const { DB } = require(join(__dirname, '..', '..', 'database', 'db.js'));
const database = new DB(join(__dirname, '..', '..', 'database', 'packages.db'));

let next_version_time: Date = new Date();
let next_file_time: Date = new Date();

@Injectable()
export class PackagesService {
    cache_versions(name, user, repo) {
        if (new Date() < next_version_time) {
            console.log(`Prevented caching versions of ${name} to prevent ratelimit.`);
            return;
        }

        fetch(`https://api.github.com/repos/${user}/${repo}/tags`).then(response => {
            response.json().then((tags: any) => {
                if (!tags.message && !tags.documentation_url && !!tags) {
                    let tag_names = [];

                    tags.forEach(tag => {
                        tag_names.push(tag.name);
                    });

                    database.read();
                    const data = database.get(name);
                    data["versions"] = tag_names;
                    database.set(name, data);
                    database.finalize();

                    console.log(`Cached versions of ${name} package.`);

                    // prevent ratelimit
                    let d = new Date();
                    next_version_time = new Date(d.setMinutes(d.getMinutes() + 2));
                }
            });
        });
    }

    cache_files(name, user, repo, tag) {
        if (new Date() < next_file_time) {
            console.log(`Prevented caching files of ${name} to prevent ratelimit.`);
            return;
        }

        fetch(`https://api.github.com/repos/${user}/${repo}/git/trees/${tag}?recursive=1`).then(response => {
            response.json().then(files => {
                if (!files.message && !files.documentation_url && !!files) {
                    let file_paths = [];

                    files.tree.forEach(file => {
                        if (!file.path.includes("/"))
                            file_paths.push(file.path);
                    });

                    database.read();
                    const data = database.get(name);
                    data["files"][tag] = file_paths;
                    database.set(name, data);
                    database.finalize();

                    console.log(`Cached files of ${name} package.`);

                    // prevent ratelimit
                    let d = new Date();
                    next_file_time = new Date(d.setMinutes(d.getMinutes() + 2));
                }
            });
        });
    }

    add(name, user, repo) {
        database.read();
        database.set(name, { user: user, repo: repo, versions: [], files: {} });
        database.finalize();

        this.cache_versions(name, user, repo);
    }

    fetch(name) {
        database.read();
        return database.get(name);
    }
}
