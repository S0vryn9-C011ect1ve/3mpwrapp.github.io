// Add public meeting to website api/events.json
import { readFileSync, writeFileSync } from 'node:fs';

const path = 'C:/Users/HP/3mpwrapp-site-tmp/api/events.json';
const raw = readFileSync(path, 'utf8');
const d = JSON.parse(raw);
const evs = d.events ? d.events : d;

const id = 'evt-tbdiwsg-public-meeting-sep14-2026';
if (evs.some(e => e.id === id)) {
  console.log('ALREADY EXISTS. total:', evs.length);
  process.exit(0);
}

const newEvent = {
  id,
  title: 'PUBLIC MEETING — Thunder Bay & District Injured Workers Support Group',
  description: 'Public meeting hosted by TBDIWSG. All injured & ill workers, peers, and advocates welcome.\n\nMonday, September 14, 2026 at 6:00 PM\nLocation: OPSEU Hall, 326 Memorial Ave., Thunder Bay\n\nFacebook event: https://www.facebook.com/share/19TujD5RAT/\nBlog post: https://thunderbayinjuredworkers.com/2026/09/11/public-meeting-thunder-bay-district-injured-workers-support-group-monday-september-14-2026-600-pm/',
  start: '2026-09-14T18:00:00',
  end: '2026-09-14T20:00:00',
  timezone: 'America/Toronto',
  location: 'OPSEU Hall — 326 Memorial Ave., Thunder Bay',
  url: 'https://thunderbayinjuredworkers.com/2026/09/11/public-meeting-thunder-bay-district-injured-workers-support-group-monday-september-14-2026-600-pm/',
  category: 'public-meeting',
  community: 'injured-workers',
  organizer: 'TBDIWSG',
  source: 'user-submitted',
  links: {
    facebook: 'https://www.facebook.com/share/19TujD5RAT/',
    blog: 'https://thunderbayinjuredworkers.com/2026/09/11/public-meeting-thunder-bay-district-injured-workers-support-group-monday-september-14-2026-600-pm/'
  }
};

evs.push(newEvent);
if (d.events) d.events = evs;
writeFileSync(path, JSON.stringify(d, null, 2));
console.log('ADDED. total:', evs.length);
