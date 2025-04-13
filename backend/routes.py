from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import networkx as nx
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Dictionary to store graphs for each building
building_graphs = {}

def build_graph(floorplan):
    G = nx.Graph()
    for node in floorplan['nodes']:
        G.add_node(node['id'], **node)
    for edge in floorplan['edges']:
        G.add_edge(edge['from'], edge['to'], weight=edge['weight'])
    return G

# Load all building JSON files from a directory
def load_building_data(directory='building_data'):
    for filename in os.listdir(directory):
        if filename.endswith('.json'):
            building_id = filename.split('.')[0]  # Use filename without extension as building ID
            with open(os.path.join(directory, filename)) as f:
                floorplan_data = json.load(f)
                building_graphs[building_id] = build_graph(floorplan_data)
                print(f"Loaded building: {building_id} with {len(building_graphs[building_id].nodes())} nodes")

# Load building data at startup
load_building_data()

# Fallback to load specific buildings if directory approach doesn't work
if not building_graphs:
    building_files = {
        'esj': 'esj.json',
        'physics': 'physics.json',
        'math': 'math.json',
        'engineering': 'engineering.json'
    }
    
    for building_id, filename in building_files.items():
        try:
            with open(filename) as f:
                floorplan_data = json.load(f)
                building_graphs[building_id] = build_graph(floorplan_data)
                print(f"Loaded building: {building_id} with {len(building_graphs[building_id].nodes())} nodes")
        except FileNotFoundError:
            print(f"Warning: Building file {filename} not found")

@app.route('/buildings', methods=['GET'])
def list_buildings():
    return jsonify({
        'buildings': list(building_graphs.keys())
    })

@app.route('/route', methods=['POST'])
def route():
    data = request.json
    start = data.get('from')
    end = data.get('to')
    building_id = data.get('building', 'esj')  # Default to 'esj' if not specified
    
    if not start or not end:
        return jsonify({'error': 'Missing start or end point'}), 400
    
    if building_id not in building_graphs:
        return jsonify({'error': f'Building {building_id} not found. Available buildings: {list(building_graphs.keys())}'}), 404
    
    graph = building_graphs[building_id]
    print(f"Using building: {building_id}")
    print(f"Available nodes: {list(graph.nodes())}")
    
    try:
        path = nx.dijkstra_path(graph, start, end, weight='weight')
        
        total_distance = 0
        for i in range(len(path)-1):
            total_distance += graph[path[i]][path[i+1]]['weight']
            
        return jsonify({
            'route': path,
            'building': building_id,
            'total_distance': total_distance
        })
    except nx.NodeNotFound as e:
        return jsonify({
            'error': f'Node not found: {str(e)}',
            'available_nodes': list(graph.nodes())
        }), 404
    except nx.NetworkXNoPath:
        return jsonify({
            'message': 'No indoor route available',
            'building': building_id
        }), 200

@app.route('/nodes', methods=['GET'])
def get_nodes():
    building_id = request.args.get('building', 'esj')
    
    if building_id not in building_graphs:
        return jsonify({'error': f'Building {building_id} not found'}), 404
        
    graph = building_graphs[building_id]
    return jsonify({
        'building': building_id,
        'nodes': list(graph.nodes())
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)