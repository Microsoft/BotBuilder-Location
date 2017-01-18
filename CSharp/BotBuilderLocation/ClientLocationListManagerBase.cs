namespace Microsoft.Bot.Builder.Location
{
    using System;
    using System.Collections.Generic;
    using Bing;
    using Builder.Dialogs;

    [Serializable]
    internal abstract class ClientLocationListManagerBase
    {
        protected abstract string key { get; }

        protected void AddToList(IDialogContext context, Location value)
        {
            var list = this.GetList(context);
            list.Add(value);
            context.UserData.SetValue(this.key, list);
        }

        protected List<Location> GetList(IDialogContext context)
        {
            List<Location> locations;

            if (context.UserData.TryGetValue(key, out locations))
            {
                return locations;
            }
            else
            {
                // return an empty list
                return new List<Location>();
            }
        }
    }
}
