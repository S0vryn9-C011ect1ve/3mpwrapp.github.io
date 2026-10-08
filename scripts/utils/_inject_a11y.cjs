#!/usr/bin/env node
/**
 * Injects accessibility scaffolding (sr-only data-table + role="img" chart
 * container + ARIA label) into the D3 viz HTML files that lack a text
 * alternative. Edits source only. Tolerant: warns and skips if a target
 * string is not found, so one bad file never aborts the rest.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '../..');

const SR_ONLY = `
        /* Screen-reader-only utility for accessible table alternatives */
        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        }
`;

// Build an sr-only table block (caption + thead + empty tbody).
function tableBlock(id, caption, head) {
    const cols = head.map(h => `<th scope="col">${h}</th>`).join('');
    return `        <table class="sr-only" id="${id}">\n` +
        `            <caption>${caption}</caption>\n` +
        `            <thead><tr>${cols}</tr></thead>\n` +
        `            <tbody></tbody>\n` +
        `        </table>\n`;
}

// Each config: chart container tag (to augment with role/aria-label),
// the injected table HTML, and a fill IIFE that populates the tbody/tbody(s).
const CONFIG = [
    {
        file: 'employer-safety-heatmap.html',
        container: '<div id="map" class="map-container"></div>',
        ariaLabel: 'Choropleth map of Ontario showing employer safety records by city (top 15 cities by employer count, WSIB NEER & CAD-7 programs, 2017-2020). A data table listing each city follows.',
        table: tableBlock('es-data-table',
            'Employer safety records by city — text alternative to the Ontario map above',
            ['City', 'Employer Count', 'NEER', 'CAD-7']),
        fill: `(function(){try{var tb=document.getElementById('es-data-table').querySelector('tbody');Object.keys(regionalData).forEach(function(city){var d=regionalData[city];var tr=document.createElement('tr');tr.innerHTML='<td>'+city+'</td><td>'+d.count.toLocaleString()+'</td><td>'+d.neer.toLocaleString()+'</td><td>'+d.cad7.toLocaleString()+'</td>';tb.appendChild(tr);});}catch(e){console.error('es table',e);}})();`
    },
    {
        file: 'injury-industry-matrix.html',
        container: '<div id="matrix" class="matrix-container"></div>',
        ariaLabel: 'Injury type by industry correlation matrix (20 injury types x 15 industries). Cell colour shows case count. A data table with every injury-industry combination follows.',
        table: tableBlock('matrix-data-table',
            'Injury type by industry case counts — text alternative to the matrix above',
            ['Injury Type', 'Industry', 'Cases', 'Success Rate']),
        fill: `(function(){try{var tb=document.getElementById('matrix-data-table').querySelector('tbody');matrixData.forEach(function(d){var tr=document.createElement('tr');tr.innerHTML='<td>'+d.injury+'</td><td>'+d.industry+'</td><td>'+d.count.toLocaleString()+'</td><td>'+d.successRate.toFixed(1)+'%</td>';tb.appendChild(tr);});}catch(e){console.error('matrix table',e);}})();`
    },
    {
        file: 'cross-tribunal-success-rates.html',
        container: '<div id="visualization"></div>',
        ariaLabel: 'Bar chart comparing appellant/applicant success rates across Ontario tribunals (WSIAT, HRTO, ONSBT). A data table with the same values follows.',
        table: tableBlock('ctsr-data-table',
            'Cross-tribunal success rates — text alternative to the bar chart above',
            ['Tribunal', 'Full Name', 'Success Rate', 'Total Cases', 'Context']),
        fill: `(function(){try{var tb=document.getElementById('ctsr-data-table').querySelector('tbody');data.forEach(function(d){var tr=document.createElement('tr');tr.innerHTML='<td>'+d.tribunal+'</td><td>'+d.fullName+'</td><td>'+d.successRate+'%</td><td>'+d.totalCases.toLocaleString()+'</td><td>'+(d.context||'')+'</td>';tb.appendChild(tr);});}catch(e){console.error('ctsr table',e);}})();`
    },
    {
        file: 'temporal-evolution.html',
        container: '<div id="chart" class="chart-container"></div>',
        ariaLabel: 'Line chart of WSIAT appeal outcomes by year (2016-2025): appeals allowed, denied, and success rate. A data table with the same yearly values follows.',
        table: tableBlock('te-data-table',
            'WSIAT outcome evolution by year — text alternative to the line chart above',
            ['Year', 'Allowed', 'Denied', 'Total Decisions', 'Success Rate (%)']),
        fill: `(function(){try{var tb=document.getElementById('te-data-table').querySelector('tbody');data.forEach(function(d){var tr=document.createElement('tr');tr.innerHTML='<td>'+d.year+'</td><td>'+d.allowed+'</td><td>'+d.denied+'</td><td>'+d.total.toLocaleString()+'</td><td>'+d.successRate+'%</td>';tb.appendChild(tr);});}catch(e){console.error('te table',e);})();`
    },
    {
        file: 'tribunal-overlap-network.html',
        container: '<div id="network-container">',
        ariaLabel: 'Network diagram of Ontario tribunal overlaps (WSIAT, ONSBT, HRTO, ONCA, ONLRB and others) showing case-volume nodes and connection links. Data tables listing nodes and links follow.',
        table: tableBlock('overlap-nodes-table',
            'Tribunal network nodes — text alternative (part 1 of 2)',
            ['Tribunal', 'Full Name', 'Cases Analyzed', 'Category']) +
            tableBlock('overlap-links-table',
            'Tribunal network links — text alternative (part 2 of 2)',
            ['From', 'To', 'Connection Strength (%)', 'Type', 'Label']),
        fill: `(function(){try{var tbN=document.getElementById('overlap-nodes-table').querySelector('tbody');var tbL=document.getElementById('overlap-links-table').querySelector('tbody');networkData.nodes.forEach(function(n){var tr=document.createElement('tr');tr.innerHTML='<td>'+n.name+'</td><td>'+n.fullName+'</td><td>'+(n.cases?n.cases.toLocaleString():'0')+'</td><td>'+(n.category||'')+'</td>';tbN.appendChild(tr);});networkData.links.forEach(function(l){var tr=document.createElement('tr');tr.innerHTML='<td>'+l.source+'</td><td>'+l.target+'</td><td>'+l.strength+'%</td><td>'+(l.type||'')+'</td><td>'+(l.label||'')+'</td>';tbL.appendChild(tr);});}catch(e){console.error('overlap table',e);}})();`
    },
    {
        file: 'wsib-appeal-funnel.html',
        container: '<div id="visualization"></div>',
        ariaLabel: 'Sankey funnel of WSIB claims from registration to final outcome (annual average 2020-2025), showing the appeal gap of 139,083 workers per year. Data tables listing stages and flows follow.',
        table: tableBlock('funnel-nodes-table',
            'WSIB appeal funnel stages — text alternative (part 1 of 2)',
            ['Stage (workers per year)']) +
            tableBlock('funnel-links-table',
            'WSIB appeal funnel flows — text alternative (part 2 of 2)',
            ['From', 'To', 'Workers per Year']),
        fill: `(function(){try{var tbN=document.getElementById('funnel-nodes-table').querySelector('tbody');var tbL=document.getElementById('funnel-links-table').querySelector('tbody');data.nodes.forEach(function(n){var tr=document.createElement('tr');tr.innerHTML='<td>'+n.name.replace(/\\n/g,' ')+'</td>';tbN.appendChild(tr);});data.links.forEach(function(l){var s=(data.nodes[l.source].name||'').replace(/\\n/g,' ');var t=(data.nodes[l.target].name||'').replace(/\\n/g,' ');var tr=document.createElement('tr');tr.innerHTML='<td>'+s+'</td><td>'+t+'</td><td>'+l.value.toLocaleString()+'</td>';tbL.appendChild(tr);});}catch(e){console.error('funnel table',e);}})();`
    },
    {
        file: 'connecting-the-dots-canlii-keyword-visualization-network.html',
        container: '<div id="network-container">',
        ariaLabel: 'Keyword co-occurrence network from 98,992 tribunal decisions (2020-2026). Node size = frequency, links = co-occurrence counts. A data table of all keyword co-occurrences follows.',
        table: tableBlock('canlii-cooc-table',
            'Tribunal keyword co-occurrence counts — text alternative to the network above',
            ['Keyword A', 'Keyword B', 'Co-occurrences']),
        fill: `(function(){try{var tb=document.getElementById('canlii-cooc-table').querySelector('tbody');Object.keys(coOccurrenceData).forEach(function(src){var targets=coOccurrenceData[src];Object.keys(targets).forEach(function(tgt){var tr=document.createElement('tr');tr.innerHTML='<td>'+src+'</td><td>'+tgt+'</td><td>'+targets[tgt].toLocaleString()+'</td>';tb.appendChild(tr);});});}catch(e){console.error('canlii table',e);}})();`
    },
    {
        file: 'connecting-the-dots-wsiat-keyword-network.html',
        container: '<div id="visualization"></div>',
        ariaLabel: 'WSIAT keyword co-occurrence network from 98,992 decisions (1987-2026) showing which legal issues cluster together. Data tables listing issue nodes and their co-occurrence links follow.',
        table: tableBlock('wsiat-nodes-table',
            'WSIAT keyword network nodes — text alternative (part 1 of 2)',
            ['Issue', 'Cases', '% of Decisions']) +
            tableBlock('wsiat-links-table',
            'WSIAT keyword network links — text alternative (part 2 of 2)',
            ['From', 'To', 'Co-occurrences', '% of Decisions']),
        fill: `(function(){try{var tbN=document.getElementById('wsiat-nodes-table').querySelector('tbody');var tbL=document.getElementById('wsiat-links-table').querySelector('tbody');networkData.nodes.forEach(function(n){var tr=document.createElement('tr');tr.innerHTML='<td>'+n.label+'</td><td>'+n.value.toLocaleString()+'</td><td>'+n.percentage+'%</td>';tbN.appendChild(tr);});networkData.links.forEach(function(l){var tr=document.createElement('tr');tr.innerHTML='<td>'+l.source+'</td><td>'+l.target+'</td><td>'+l.value.toLocaleString()+'</td><td>'+l.percentage+'%</td>';tbL.appendChild(tr);});}catch(e){console.error('wsiat table',e);}})();`
    },
    {
        file: 'wsib-denial-network-visualization.html',
        container: '<div id="network-container"></div>',
        ariaLabel: 'Tribunal keyword network visualization (redirects to the CanLII keyword network). A data table of keyword co-occurrences follows.',
        table: tableBlock('denial-cooc-table',
            'Tribunal keyword co-occurrence counts — text alternative to the network above',
            ['Keyword A', 'Keyword B', 'Co-occurrences']),
        fill: `(function(){try{var tb=document.getElementById('denial-cooc-table').querySelector('tbody');if(typeof coOccurrenceData!=='undefined'){Object.keys(coOccurrenceData).forEach(function(src){var targets=coOccurrenceData[src];Object.keys(targets).forEach(function(tgt){var tr=document.createElement('tr');tr.innerHTML='<td>'+src+'</td><td>'+tgt+'</td><td>'+targets[tgt].toLocaleString()+'</td>';tb.appendChild(tr);});});}}catch(e){console.error('denial table',e);}})();`
    }
];

let ok = 0, warn = 0;
for (const cfg of CONFIG) {
    const fp = path.join(ROOT, cfg.file);
    if (!fs.existsSync(fp)) { console.log('SKIP (missing) ' + cfg.file); warn++; continue; }
    let html = fs.readFileSync(fp, 'utf-8');

    // 1. sr-only CSS before first </style>
    if (!html.includes('.sr-only')) {
        const idx = html.indexOf('</style>');
        if (idx === -1) { console.log('WARN no </style> ' + cfg.file); warn++; continue; }
        html = html.slice(0, idx) + SR_ONLY + html.slice(idx);
    }

    // 2. Augment chart container with role=img + aria-label, and inject the table after it.
    if (!html.includes(cfg.container)) {
        console.log('WARN container not found: ' + cfg.file + ' :: ' + cfg.container); warn++; continue;
    }
    const augContainer = cfg.container.replace('>', ' role="img" aria-label="' + cfg.ariaLabel + '">');
    html = html.replace(cfg.container, augContainer + '\n' + cfg.table);

    // 3. Append fill script before </body>.
    const fillScript = '    <script>\n        ' + cfg.fill + '\n    </script>\n';
    if (html.includes('</body>')) {
        html = html.replace('</body>', fillScript + '</body>');
    } else {
        html += fillScript;
    }

    fs.writeFileSync(fp, html);
    console.log('OK ' + cfg.file);
    ok++;
}
console.log(`\nDONE: ${ok} injected, ${warn} warnings`);
