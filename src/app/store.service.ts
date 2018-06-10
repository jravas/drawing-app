import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private _url: string = 'http://localhost:3000/data';

  constructor(private http: HttpClient) { }
  getJSONService(){
    return this.http.get(this._url);
  }
  postJSONService(data){
    return this.http.post(this._url, {data});
  }
}
