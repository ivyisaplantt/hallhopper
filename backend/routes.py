from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import networkx as nx

app = Flask(__name__)

def build_graph(floorplan):
    G = nx.Graph()
    for node in floorplan['nodes']:
        G.add_node(node['id'], **node)
    for edge in floorplan['edges']:
        G.add_edge(edge['from'], edge['to'], weight=edge['weight'])
    return G

with open('esj.json') as f:
    floorplan_data = json.load(f)
graph = build_graph(floorplan_data)

@app.route('/route', methods=['POST'])
def route():
    data = request.json
    start = data.get('from')
    end = data.get('to')
    weight = data.get('weight')

    if not start or not end:
        return jsonify({'error': 'Missing start or end point'}), 400

    print(list(graph.nodes()))

    try:
        path = nx.dijkstra_path(graph, start, end, weight='weight')
        return jsonify({'route': path})
    except nx.NetworkXNoPath:
        return jsonify({
            'message': 'No indoor route available',
        }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
    