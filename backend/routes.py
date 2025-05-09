from flask import Flask, request, jsonify
from flask_cors import CORS
from collections import OrderedDict
import json
import networkx as nx
import os

app = Flask(__name__)
CORS(app)

building_graphs = {}
campus_graph = None

def build_graph(floorplan):
    G = nx.Graph()
    for node in floorplan['nodes']:
        G.add_node(node['id'], **node)
    for edge in floorplan['edges']:
        G.add_edge(edge['from'], edge['to'], weight=edge['weight'])
    return G

def load_building_data(directory='building_data'):
    global campus_graph
    try:
        for filename in os.listdir(directory):
            if filename.endswith('.json'):
                building_id = filename.split('.')[0]
                with open(os.path.join(directory, filename)) as f:
                    floorplan_data = json.load(f)
                    if building_id == 'campus':
                        campus_graph = build_graph(floorplan_data)
                        print(f"Loaded campus graph with {len(campus_graph.nodes())} nodes")
                    else:
                        building_graphs[building_id] = build_graph(floorplan_data)
                        print(f"Loaded building: {building_id} with {len(building_graphs[building_id].nodes())} nodes")
    except (FileNotFoundError, NotADirectoryError):
        print(f"Warning: Directory {directory} not found or not accessible")

load_building_data()

if not building_graphs or campus_graph is None:
    building_files = {
        'esj': 'esj.json',
        'physics': 'physics.json',
        'math': 'math.json',
    }

    try:
        with open('campus.json') as f:
            campus_data = json.load(f)
            campus_graph = build_graph(campus_data)
            print(f"Loaded campus graph with {len(campus_graph.nodes())} nodes")
    except FileNotFoundError:
        print("Warning: campus.json not found")
        campus_graph = nx.Graph()
    
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

BUILDING_ENTRY_EXITS = {
    'math': {
        'glenn': {'entry': '1298', 'exit': '1298'},
        'physics': {'entry': '1199', 'exit': '1199'}
    },
    'physics': {
        'math': {'entry': '1197', 'exit': '1197'},
        'symons': {'entry': '1196', 'exit': '1196'}
    },
    'esj': {
        'symons': {'entry': '0399', 'exit': '0399'},
        'hjp': {'entry': '1299', 'exit': '1299'}
    }
}

@app.route('/route', methods=['POST'])
def route():
    data = request.json
    start = data.get('from')
    end = data.get('to')
    building_id = data.get('building')
    
    if not start or not end:
        return jsonify({'error': 'Missing start or end point'}), 400
    
    if building_id and building_id in building_graphs:
        return get_indoor_route(start, end, building_id)
    
    elif campus_graph and start in campus_graph.nodes and end in campus_graph.nodes:
        return get_campus_route(start, end)

    else:
        return jsonify({
            'error': 'Invalid start or end point, or missing building ID'
        }), 400

def get_indoor_route(start, end, building_id):
    graph = building_graphs[building_id]
    
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

def get_campus_route(start, end):
    try:
        campus_path = nx.dijkstra_path(campus_graph, start, end, weight='weight')
        
        building_names = {node['id']: node['building'] for node in campus_graph.nodes.values()}
        
        total_outdoor_distance = 0
        for i in range(len(campus_path) - 1):
            total_outdoor_distance += campus_graph[campus_path[i]][campus_path[i + 1]]['weight']

        complete_path = {
            "route": [],
            "total_distance": total_outdoor_distance
        }

        for i, building_id in enumerate(campus_path):
            building_data = {"building": building_names.get(building_id, building_id), "indoor_path": []}

            if building_id in building_graphs:
                prev_building = campus_path[i - 1] if i > 0 else None
                next_building = campus_path[i + 1] if i < len(campus_path) - 1 else None

                entry, exit = None, None
                
                if prev_building and prev_building in BUILDING_ENTRY_EXITS.get(building_id, {}):
                    entry = BUILDING_ENTRY_EXITS[building_id][prev_building]['entry']
                
                if next_building and next_building in BUILDING_ENTRY_EXITS.get(building_id, {}):
                    exit = BUILDING_ENTRY_EXITS[building_id][next_building]['exit']

                if entry and exit:
                    try:
                        building_graph = building_graphs[building_id]
                        indoor_path = nx.dijkstra_path(building_graph, entry, exit, weight='weight')
                        building_data["indoor_path"] = indoor_path
                    except (nx.NetworkXNoPath, nx.NodeNotFound):
                        pass

            complete_path["route"].append(building_data)

        return jsonify(complete_path)

    except nx.NodeNotFound as e:
        return jsonify({
            "error": f"Invalid building in path: {str(e)}",
            "available_buildings": list(campus_graph.nodes())
        }), 400
    except nx.NetworkXNoPath:
        return jsonify({
            "message": "No campus route available between these buildings"
        }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)