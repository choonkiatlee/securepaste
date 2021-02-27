import google from 'google'



export function initialiseGoogleChart(chartElem){
    google.charts.load('current', {packages: ['corechart', 'bar']});
    google.charts.setOnLoadCallback(()=>{ drawBasic(chartElem, 0, 0, 0, 0) });
}

export function drawCompressionStatsChart(
    chartElem,
    input_num_bytes,
    control_num_bytes,
    encryption_overhead_num_bytes,
    total_output_num_bytes,
) {

    const compressed_data_size = total_output_num_bytes - encryption_overhead_num_bytes - control_num_bytes;

    let unit = "(bytes)";
    if ((input_num_bytes > 10000) || (total_output_num_bytes > 10000)){
        input_num_bytes = input_num_bytes / 1000;
        control_num_bytes = control_num_bytes / 1000;
        encryption_overhead_num_bytes = encryption_overhead_num_bytes / 1000;
        total_output_num_bytes = total_output_num_bytes / 1000;
        unit = "(kB)";
    }

    var data = google.visualization.arrayToDataTable([
      ['Size', 'Input', 'SecurePaste Overhead', 'Encryption Overhead', 'Compressed Data', { role: 'annotation' } ],
      ['Input Size ' + unit, input_num_bytes, 0, 0, 0, `total: ${input_num_bytes} ` + unit],
      ['Output Size ' + unit, 0, control_num_bytes, encryption_overhead_num_bytes, compressed_data_size, `total: ${total_output_num_bytes} ` + unit],
    ]);

    var options = {
    //   width: 600,
    //   height: 400,
      legend: { position: 'top', maxLines: 3 },
      bar: { groupWidth: '75%' },
      isStacked: true
    };

    var chart = new google.visualization.BarChart(chartElem);

    chart.draw(data, options);
}