import{
    CostExplorerClient,
    GetCostAndUsageCommand,
} from "@aws-sdk/client-cost-explorer";

const MODE = process.env.COST_MODE || "mock";
const TTL_MS= 6*60*60*1000;
let cache ={at:0, data:null};

const round=(n)=>Math.round(n*100)/100;
const fmt = (d)=> d.toISOString().slice(0,10);

function mockCosts(){
    return[
    { service: "Amazon EC2", cost: 42.15 },
    { service: "Amazon RDS", cost: 21.8 },
    { service: "Amazon S3", cost: 3.42 },
    { service: "AWS Data Transfer", cost: 7.1 },
    { service: "Amazon CloudWatch", cost: 2.35 },
    ];
}

async function realCosts(){
    const client = new CostExplorerClient({ region: "us-east-1" });
    const end = new Date();
    let start = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1));
    if(fmt(end)==fmt(end)){
        start=new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth()-1, 1));
    }
    const res = await client.send(
        new GetCostAndUsageCommand({
            TimePeriod: { Start: fmt(start), End: fmt(end) },
            Granularity: "MONTHLY",
            Metrics: ["UnblendedCost"],
            GroupBy: [{ Type: "DIMENSION", Key: "SERVICE" }],
        })
    );
    const groups = res.ResultsByTime[0].Groups ??[];
    return groups.map((g) => ({
        service: g.Keys[0],
        cost: round(parseFloat(g.Metrics.UnblendedCost.Amount)),
    }))
    .filter((g) => g.cost > 0);
}

export async function getCosts(){
    if(cache.data && Date.now()-cache.at<TTL_MS){
        return cache.data;
    }
    const items = MODE=="mock" ? mockCosts() : await realCosts();
    const total = round(items.reduce((sum, i) => sum + i.cost, 0));
    cache = { at: Date.now(), data: { mode: MODE, currency: "USD", items, total } };
    return cache.data;
}

