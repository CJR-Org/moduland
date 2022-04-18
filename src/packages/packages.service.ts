import { Injectable } from '@nestjs/common';
import fetch from 'node-fetch';
import { log } from 'src/log';
import { DB } from 'database/VersatileDB';
import { join } from 'path';

const database = new DB(
  join(__dirname, '..', '..', 'database', 'packages.db'),
  {
    schema: join(__dirname, '..', '..', 'database', 'schema.json'),
  },
).read();

let next_version_time: Date = new Date();
let next_file_time: Date = new Date();

@Injectable()
export class PackagesService {
  cache_versions(name, user, repo) {
    if (new Date() < next_version_time) {
      log(`Prevented caching versions of ${name} to prevent ratelimit.`);
      return;
    }

    fetch(`https://api.github.com/repos/${user}/${repo}/tags`).then(
      (response) => {
        response.json().then((tags: any) => {
          if (!tags.message && !tags.documentation_url && !!tags) {
            let tag_names = [];

            tags.forEach((tag) => {
              tag_names.push(tag.name);
            });

            const data = database.read_and_get(name);
            data['versions'] = tag_names;
            database.set_and_commit(name, data);

            log(`Cached versions of ${name} package.`);

            // prevent ratelimit
            let d = new Date();
            next_version_time = new Date(d.setMinutes(d.getMinutes() + 5));
          }
        });
      },
    );
  }

  cache_files(name, user, repo, tag) {
    if (new Date() < next_file_time) {
      log(`Prevented caching files of ${name} to prevent ratelimit.`);
      return;
    }

    fetch(
      `https://api.github.com/repos/${user}/${repo}/git/trees/${tag}?recursive=1`,
    ).then((response) => {
      response.json().then((files) => {
        if (!files.message && !files.documentation_url && !!files) {
          let file_paths = [];

          files.tree.forEach((file) => {
            if (!file.path.includes('/')) file_paths.push(file.path);
          });

          const data = database.read_and_get(name);
          data['files'][tag] = file_paths;
          database.set_and_commit(name, data);

          log(`Cached files of ${name} package.`);

          // prevent ratelimit
          let d = new Date();
          next_file_time = new Date(d.setMinutes(d.getMinutes() + 30));
        }
      });
    });
  }

  add(name, user, repo) {
    database.read();
    database.create_and_commit('package', {
      name,
      user,
      repo,
    });

    log(`Created ${name} package.`);

    this.cache_versions(name, user, repo);
  }

  fetch(name) {
    return database.read_and_get(name);
  }
}
