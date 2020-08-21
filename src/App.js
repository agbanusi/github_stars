import React, { Component } from 'react'
import "./App.css"

//global variable for debouncing
export default class App extends Component {
    constructor(props){
        super(props)
        this.debounce=false;
        this.state={
            completeData:[],
            store:[],
            data:[],
            incomplete:false,
            page:0,
            value:'',
            date:30,
            height:"",
            loading:true,
            loader:false
        }
    }
    componentDidMount(){
        this.main(true)
        setInterval(()=>{
            this.debounce=true;
            this.perfect()
        },1500)
    }
    main=async(send,nu)=>{
        var num=nu?nu:this.state.date //optional parameter
        const date=this.getDate(num)
        const data=await this.getData(date)
        if(send){
            if(!data.error && data.items){
                //save the results gotten
                this.setState({data:data.items.slice(0,10),store:data.items.slice(10),completeData:data.items,incomplete:data.incomplete_results,page:1,loading:false})
            }else{
                //refresh page in case of error
                this.setState({loading:false})
                document.getElementById('cover').innerHTML=data.error+'<a href="/">refresh</a>.'
                
            }
        }
        return data
    }
    getDate=(num)=>{
        //get the present date in milliseconds then subtract the number of milliseconds
        //spent in the last 30 days to get the date in milliseconds of 30days ago and format it
        const presentDate= Date.now()
        const diff = num*24*3600*1000 //30 days with 24 hrs and 3600s and 1000 milliseconds
        const previousDate=new Date(presentDate-diff) //get the date in milliseconds and convert to date object
        const dateFormat= previousDate.getFullYear()+'-'+this.format(previousDate.getMonth()+1)+'-'+this.format(previousDate.getDate()) //format it to specs
        return dateFormat
    }
    getDays=(date)=>{
        //get current date
        const presentDate=Date.now()
        //parse given date to milliseconds since jan 1 1970
        const pastDate=Date.parse(date)
        const diff=presentDate-pastDate
        //after getting the difference, get the difference in days
        const days=diff/(1000*3600*24)
        return Math.round(days)
    }
    format=(st)=>{
        //format numbers less than ten to have a zero in front of them
        if(st>9){
            return st
        }
        return '0'+st
    }
    getData=async(date,page)=>{
        //check if page number is given or not and if given format it
        page = page>0? '&page='+page:''
        //try to fetch or catch the error
        try{
            //fetch successfully and convert to json then return the result
            const resp=await fetch('https://api.github.com/search/repositories?q=created:>'+date+'&sort=stars&order=desc')
            const data =await resp.json()
            return data
        }catch{
            return{'error':'Something very wrong has occured, please check your connection and refresh'}
        }
        
    }
    add=async()=>{
        //this is to add more to the data shown on the screen from either the store or
        //from the api if the results are incomplete.
        const length=this.state.store.length-1
        if(this.state.store.length<9 && this.state.incomplete){
            const data=await this.main(false)
            this.setState({store:data.items.slice(10-length),data:[...this.state.data,...this.state.store,...data.items.slice(0,10-length)]
                ,completeData:[...this.state.completeData,...data.items],incomplete:data.incomplete_results,page:this.state.page+1,loader:false})
        }
        else{
            this.setState({data:[...this.state.data,...this.state.store.slice(0,10)],store:[...this.state.store.slice(10)]})
        }
    }
    name=(fullname)=>{
        //a simple function to get the actual name of repo from the fullname sent
        let name=fullname.split('/')
        return name[name.length-1]
    }
    getHeight=()=>{
        //get the height of the cover, the scrolltop and also the height of each item rendered
        const cover=document.getElementById('cover')
        const item=document.getElementsByClassName('row')[0]
        if(item){
            let height={scroll:cover.scrollHeight, top:cover.scrollTop,offset:cover.offsetHeight, item:item.clientHeight}
            this.setState({height})
            return height
        }
        return this.state.height
    };
    paginate=()=>{
        //it is a callback function for the scroll event listener, which checks if the user
        //scrolls past a particula point, here close to the end of the rendered page, then render more items
        let tt=this.getHeight()
        //condition for if the page is at its end and the debounce is activated
        if(tt.top+tt.offset >=tt.scroll-100 && this.debounce){
            //save the required heights
            this.setState({height:tt})
            //conditional change of the loader key for rendering loading below the page
            if(this.state.incomplete){this.setState({loader:true})}
            this.add()     //call the function add
            this.debounce=false   //deactivate the scroll for a sort while
        }
    }
    change =(e)=>{
        //a callback function for the change event listener for inputs,
        //the search filters rendered pages,
        ///the number changes the date, which the default is 30days 
        switch(e.target.id){
            case 'search':
                this.setState({value:e.target.value})
                if(e.target.value != ""){this.search(e.target.value) }
                break;
            case 'number':
                this.setState({date: Number(e.target.value)})
                if(e.target.value !=="" && Number(e.target.value)){
                this.setState({loading:true})
                this.main(true,Number(e.target.value))
                }
        }
    }
    exist=(val1,val2)=>{
        //a filter function for the items rendered
        if((val1 && val2)){
            val1=val1.trim().toLowerCase()
            val2=val2.trim().toLowerCase()
            if(val1.includes(val2) || val2.includes(val1)){
                return true
            }
            return false
        }
        return false
    }
    perfect=()=>{
        //a function to check for duplicates as the api tends to send duplicates
        //when it's reached the end
        let name=this.state.completeData.map(i=>i.full_name)
        let des=this.state.completeData.map(i=>i.description).filter(i=>i!=undefined)
        if(new Set(name).size !== name.length && new Set(des).size !== des.length){
            this.setState({incomplete:false})
        }
    }
    search=(val)=>{
        //the search function which sends the data that should be rendered
        let totalData=this.state.completeData
        totalData=totalData.filter(i=>this.exist(i.full_name,val) || this.exist(i.owner.login,val) || this.exist(i.description,val))
        this.setState({data:totalData.slice(0,10),store:totalData.slice(10)})
    }
    render() {
        return (
           <div id='cover' onScroll={this.paginate}>
                <div>
                <h1 >Trending Repos</h1>
                <div className='mid dine'><i className="fa fa-search" aria-hidden="true"></i><input id='search' placeholder="Search by repo name description or author's name" value={this.state.value} onChange={this.change} /></div>
                <div className='mid'><h5>Change the time interval in days here (default is 30 days): </h5><input id='number' value={this.state.date} onChange={this.change} /></div>
                </div>
                {this.state.loading?
                    <div className='load'> Loading...</div>:
                    this.state.data.map((repo,k)=>(
                    <div className='row' id={k} key={k}>
                      <a href={repo.html_url}>
                        <img src={repo.owner.avatar_url} />
                        <div>
                            <h3>{this.name(repo.full_name)}</h3>
                            <h5>{!repo.description? 'Nil': repo.description.length>100?repo.description.slice(0,98)+'...':repo.description}</h5>
                            <div className='divide'>
                            <p className='border'>{repo.stargazers_count>0?'Stars: '+ repo.stargazers_count:'Nb Stars'}</p>
                            <p className='border'>{repo.open_issues_count>0?'Issues: '+ repo.open_issues_count:'Nb Issues'}</p>
                            <p>{'Submitted '+this.getDays(repo.created_at)+' days ago by '+repo.owner.login}</p>
                            </div>
                        </div>
                      </a>  
                    </div>
                ))}
                {this.state.loader?<p>Loading...</p>:<></>}
            </div>
            
        )
    }
}
